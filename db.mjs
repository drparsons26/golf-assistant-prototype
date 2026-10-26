import pg from "pg";
import { randomBytes, createHash } from "node:crypto";

const SESSION_DAYS = 90;
const LOGIN_LINK_MINUTES = 15;

let pool = null;

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getPool() {
  if (!isDatabaseConfigured()) {
    return null;
  }

  if (!pool) {
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: Number(process.env.DATABASE_POOL_MAX || 4),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });

    pool.on("error", error => {
      console.error("Postgres pool error:", error.message);
    });
  }

  return pool;
}

export async function query(text, params = []) {
  const activePool = getPool();

  if (!activePool) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return activePool.query(text, params);
}

export async function initializeSchema() {
  if (!isDatabaseConfigured()) {
    return false;
  }

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_seen_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS login_links (
      token_hash TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      expires_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS club_distances (
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      club TEXT NOT NULL,
      carry_yards INTEGER NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (user_id, club)
    );

    CREATE TABLE IF NOT EXISTS shots (
      id TEXT PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      played_at TIMESTAMPTZ NOT NULL,
      course_name TEXT,
      hole INTEGER,
      par INTEGER,
      club TEXT NOT NULL,
      distance_yards INTEGER NOT NULL,
      result TEXT,
      lie TEXT,
      direction TEXT
    );

    CREATE INDEX IF NOT EXISTS shots_user_idx ON shots (user_id, played_at DESC);

    CREATE TABLE IF NOT EXISTS rounds (
      id TEXT PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_name TEXT,
      tee_name TEXT,
      total_holes INTEGER,
      finished_at TIMESTAMPTZ NOT NULL,
      players JSONB NOT NULL DEFAULT '[]'::jsonb,
      hole_pars JSONB NOT NULL DEFAULT '{}'::jsonb,
      scores JSONB NOT NULL DEFAULT '{}'::jsonb,
      hole_stats JSONB NOT NULL DEFAULT '{}'::jsonb,
      totals JSONB NOT NULL DEFAULT '[]'::jsonb
    );

    CREATE INDEX IF NOT EXISTS rounds_user_idx ON rounds (user_id, finished_at DESC);

    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      course_name TEXT NOT NULL,
      tee_name TEXT,
      total_holes INTEGER,
      hole_pars JSONB NOT NULL DEFAULT '{}'::jsonb,
      hole_lengths JSONB NOT NULL DEFAULT '{}'::jsonb,
      hole_targets JSONB NOT NULL DEFAULT '{}'::jsonb,
      hole_hazards JSONB NOT NULL DEFAULT '{}'::jsonb,
      source TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  return true;
}

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function createToken() {
  return randomBytes(32).toString("base64url");
}

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function isValidEmail(email) {
  return /^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email);
}

export async function createLoginLink(email) {
  const token = createToken();
  const expiresAt = new Date(Date.now() + LOGIN_LINK_MINUTES * 60 * 1000);

  await query(
    `INSERT INTO login_links (token_hash, email, expires_at) VALUES ($1, $2, $3)`,
    [hashToken(token), email, expiresAt]
  );

  return { token, expiresAt, minutes: LOGIN_LINK_MINUTES };
}

export async function redeemLoginLink(token) {
  const tokenHash = hashToken(token);
  const linkResult = await query(
    `UPDATE login_links SET used_at = now()
     WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()
     RETURNING email`,
    [tokenHash]
  );

  if (linkResult.rowCount === 0) {
    return null;
  }

  const email = linkResult.rows[0].email;
  const userResult = await query(
    `INSERT INTO users (email, last_seen_at) VALUES ($1, now())
     ON CONFLICT (email) DO UPDATE SET last_seen_at = now()
     RETURNING id, email`,
    [email]
  );
  const user = userResult.rows[0];
  const sessionToken = createToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await query(
    `INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)`,
    [hashToken(sessionToken), user.id, expiresAt]
  );

  await query(`DELETE FROM login_links WHERE expires_at < now() - interval '1 day'`);

  return { user, sessionToken, expiresAt };
}

export async function getUserForSession(token) {
  if (!token) {
    return null;
  }

  const result = await query(
    `SELECT u.id, u.email FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [hashToken(token)]
  );

  return result.rowCount === 0 ? null : result.rows[0];
}

export async function deleteSession(token) {
  if (!token) {
    return;
  }

  await query(`DELETE FROM sessions WHERE token_hash = $1`, [hashToken(token)]);
}

export async function deleteUser(userId) {
  await query(`DELETE FROM users WHERE id = $1`, [userId]);
}

export async function pushUserData(userId, payload) {
  const clubs = Array.isArray(payload.clubs) ? payload.clubs : [];
  const shots = Array.isArray(payload.shots) ? payload.shots : [];
  const rounds = Array.isArray(payload.rounds) ? payload.rounds : [];
  const courses = Array.isArray(payload.courses) ? payload.courses : [];

  for (const club of clubs.slice(0, 40)) {
    const name = String(club.club || "").slice(0, 60).trim();
    const carry = Number(club.carryYards);

    if (!name || !Number.isFinite(carry) || carry < 20 || carry > 400) {
      continue;
    }

    await query(
      `INSERT INTO club_distances (user_id, club, carry_yards, updated_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (user_id, club) DO UPDATE
         SET carry_yards = EXCLUDED.carry_yards, updated_at = now()`,
      [userId, name, Math.round(carry)]
    );
  }

  for (const shot of shots.slice(-1000)) {
    const id = String(shot.id || `${userId}-${shot.time}-${shot.club}-${shot.distanceYards}`).slice(0, 120);
    const distance = Number(shot.distanceYards);

    if (!shot.club || !Number.isFinite(distance)) {
      continue;
    }

    await query(
      `INSERT INTO shots (id, user_id, played_at, course_name, hole, par, club, distance_yards, result, lie, direction)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO NOTHING`,
      [
        id,
        userId,
        shot.time || new Date().toISOString(),
        String(shot.courseName || "").slice(0, 160),
        Number(shot.hole) || null,
        Number(shot.par) || null,
        String(shot.club).slice(0, 60),
        Math.round(distance),
        String(shot.result || "").slice(0, 20),
        String(shot.lie || "").slice(0, 20),
        String(shot.direction || "").slice(0, 20)
      ]
    );
  }

  for (const round of rounds.slice(-200)) {
    if (!round.id || !round.finishedAt) {
      continue;
    }

    await query(
      `INSERT INTO rounds (id, user_id, course_name, tee_name, total_holes, finished_at, players, hole_pars, scores, hole_stats, totals)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO UPDATE SET
         scores = EXCLUDED.scores,
         hole_stats = EXCLUDED.hole_stats,
         totals = EXCLUDED.totals`,
      [
        String(round.id).slice(0, 120),
        userId,
        String(round.courseName || "").slice(0, 160),
        String(round.teeName || "").slice(0, 60),
        Number(round.totalHoles) || 18,
        round.finishedAt,
        JSON.stringify(round.players || []),
        JSON.stringify(round.holePars || {}),
        JSON.stringify(round.scores || {}),
        JSON.stringify(round.holeStats || {}),
        JSON.stringify(round.totals || [])
      ]
    );
  }

  for (const course of courses.slice(0, 200)) {
    if (!course.id || !course.courseName) {
      continue;
    }

    await query(
      `INSERT INTO courses (id, course_name, tee_name, total_holes, hole_pars, hole_lengths, hole_targets, hole_hazards, source, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())
       ON CONFLICT (id) DO UPDATE SET
         course_name = EXCLUDED.course_name,
         tee_name = EXCLUDED.tee_name,
         total_holes = EXCLUDED.total_holes,
         hole_pars = EXCLUDED.hole_pars,
         hole_lengths = EXCLUDED.hole_lengths,
         hole_targets = EXCLUDED.hole_targets,
         hole_hazards = EXCLUDED.hole_hazards,
         updated_at = now()`,
      [
        String(course.id).slice(0, 120),
        String(course.courseName).slice(0, 160),
        String(course.teeName || "").slice(0, 60),
        Number(course.totalHoles) || 18,
        JSON.stringify(course.holePars || {}),
        JSON.stringify(course.holeLengths || {}),
        JSON.stringify(course.holeTargets || {}),
        JSON.stringify(course.holeHazards || {}),
        String(course.source || "manual").slice(0, 40)
      ]
    );
  }

  return {
    clubs: clubs.length,
    shots: shots.length,
    rounds: rounds.length,
    courses: courses.length
  };
}

export async function pullUserData(userId) {
  const [clubs, shots, rounds, courses] = await Promise.all([
    query(`SELECT club, carry_yards FROM club_distances WHERE user_id = $1 ORDER BY carry_yards DESC`, [userId]),
    query(`SELECT id, played_at, course_name, hole, par, club, distance_yards, result, lie, direction
           FROM shots WHERE user_id = $1 ORDER BY played_at ASC LIMIT 1000`, [userId]),
    query(`SELECT id, course_name, tee_name, total_holes, finished_at, players, hole_pars, scores, hole_stats, totals
           FROM rounds WHERE user_id = $1 ORDER BY finished_at ASC LIMIT 200`, [userId]),
    query(`SELECT id, course_name, tee_name, total_holes, hole_pars, hole_lengths, hole_targets, hole_hazards, source
           FROM courses ORDER BY updated_at DESC LIMIT 200`, [])
  ]);

  return {
    clubs: clubs.rows.map(row => ({ club: row.club, carryYards: row.carry_yards })),
    shots: shots.rows.map(row => ({
      id: row.id,
      time: row.played_at,
      courseName: row.course_name,
      hole: row.hole,
      par: row.par,
      club: row.club,
      distanceYards: row.distance_yards,
      result: row.result,
      lie: row.lie,
      direction: row.direction
    })),
    rounds: rounds.rows.map(row => ({
      id: row.id,
      courseName: row.course_name,
      teeName: row.tee_name,
      totalHoles: row.total_holes,
      finishedAt: row.finished_at,
      players: row.players,
      holePars: row.hole_pars,
      scores: row.scores,
      holeStats: row.hole_stats,
      totals: row.totals
    })),
    courses: courses.rows.map(row => ({
      id: row.id,
      courseName: row.course_name,
      teeName: row.tee_name,
      totalHoles: row.total_holes,
      holePars: row.hole_pars,
      holeLengths: row.hole_lengths,
      holeTargets: row.hole_targets,
      holeHazards: row.hole_hazards,
      source: row.source
    }))
  };
}
