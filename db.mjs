import pg from "pg";
import { randomBytes, createHash } from "node:crypto";

const SESSION_DAYS = 90;
const LOGIN_LINK_MINUTES = 15;
const MAX_PENDING_LINKS_PER_EMAIL = 3;

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
      ssl: buildSslOptions(),
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

// Verify remote database certificates by default. Local PostgreSQL instances
// commonly run without TLS; DATABASE_CA_CERT supports private certificate
// authorities without weakening verification.
function buildSslOptions() {
  const databaseUrl = new URL(process.env.DATABASE_URL);

  if (databaseUrl.hostname === "localhost" || databaseUrl.hostname === "127.0.0.1") {
    return false;
  }

  const ca = String(process.env.DATABASE_CA_CERT || "").trim();
  return ca ? { ca, rejectUnauthorized: true } : { rejectUnauthorized: true };
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
      id TEXT NOT NULL,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      played_at TIMESTAMPTZ NOT NULL,
      course_name TEXT,
      hole INTEGER,
      par INTEGER,
      club TEXT NOT NULL,
      distance_yards INTEGER NOT NULL,
      result TEXT,
      lie TEXT,
      direction TEXT,
      PRIMARY KEY (user_id, id)
    );

    CREATE INDEX IF NOT EXISTS shots_user_idx ON shots (user_id, played_at DESC);

    CREATE TABLE IF NOT EXISTS rounds (
      id TEXT NOT NULL,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_name TEXT,
      tee_name TEXT,
      total_holes INTEGER,
      finished_at TIMESTAMPTZ NOT NULL,
      players JSONB NOT NULL DEFAULT '[]'::jsonb,
      hole_pars JSONB NOT NULL DEFAULT '{}'::jsonb,
      scores JSONB NOT NULL DEFAULT '{}'::jsonb,
      hole_stats JSONB NOT NULL DEFAULT '{}'::jsonb,
      totals JSONB NOT NULL DEFAULT '[]'::jsonb,
      PRIMARY KEY (user_id, id)
    );

    CREATE INDEX IF NOT EXISTS rounds_user_idx ON rounds (user_id, finished_at DESC);

    CREATE TABLE IF NOT EXISTS courses (
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      id TEXT NOT NULL,
      course_name TEXT NOT NULL,
      tee_name TEXT,
      total_holes INTEGER,
      hole_pars JSONB NOT NULL DEFAULT '{}'::jsonb,
      hole_lengths JSONB NOT NULL DEFAULT '{}'::jsonb,
      hole_targets JSONB NOT NULL DEFAULT '{}'::jsonb,
      hole_hazards JSONB NOT NULL DEFAULT '{}'::jsonb,
      source TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (user_id, id)
    );
  `);

  await migrateOwnership();
  return true;
}

// Earlier builds keyed rounds, shots, and courses on a client-supplied id
// alone, which let one account overwrite or squat another account's rows.
// Ownership now belongs in the primary key. The migration is transactional:
// startup fails instead of quietly running with a partially secured schema.
async function migrateOwnership() {
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");
    await client.query(
      `ALTER TABLE courses
       ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id) ON DELETE CASCADE`
    );
    await client.query(`DELETE FROM courses WHERE user_id IS NULL`);
    await client.query(`ALTER TABLE courses ALTER COLUMN user_id SET NOT NULL`);

    for (const tableName of ["courses", "rounds", "shots"]) {
      await ensureOwnedPrimaryKey(client, tableName);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function ensureOwnedPrimaryKey(client, tableName) {
  const result = await client.query(
    `SELECT array_agg(attribute.attname ORDER BY key_column.ordinality) AS columns
     FROM pg_constraint AS key_constraint
     JOIN LATERAL unnest(key_constraint.conkey) WITH ORDINALITY
       AS key_column(attnum, ordinality) ON true
     JOIN pg_attribute AS attribute
       ON attribute.attrelid = key_constraint.conrelid
      AND attribute.attnum = key_column.attnum
     WHERE key_constraint.conrelid = $1::regclass
       AND key_constraint.contype = 'p'`,
    [tableName]
  );
  const columns = result.rows[0].columns || [];

  if (columns.length === 2 && columns[0] === "user_id" && columns[1] === "id") {
    return;
  }

  await client.query(`ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS ${tableName}_pkey`);
  await client.query(`ALTER TABLE ${tableName} ADD PRIMARY KEY (user_id, id)`);
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

  await query(`DELETE FROM login_links WHERE expires_at < now()`);

  const pending = await query(
    `SELECT count(*)::int AS count FROM login_links
     WHERE email = $1 AND used_at IS NULL AND expires_at > now()`,
    [email]
  );

  if (pending.rows[0].count >= MAX_PENDING_LINKS_PER_EMAIL) {
    return null;
  }

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
  const clubs = Array.isArray(payload.clubs) ? payload.clubs.slice(0, 40) : [];
  const shots = Array.isArray(payload.shots) ? payload.shots.slice(-1000) : [];
  const rounds = Array.isArray(payload.rounds) ? payload.rounds.slice(-200) : [];
  const courses = Array.isArray(payload.courses) ? payload.courses.slice(0, 200) : [];
  const accepted = { clubs: 0, shots: 0, rounds: 0, courses: 0 };
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");

    for (const club of clubs) {
      const name = String(club.club || "").slice(0, 60).trim();
      const carry = Number(club.carryYards);

      if (!name || !Number.isFinite(carry) || carry < 20 || carry > 400) {
        continue;
      }

      await client.query(
        `INSERT INTO club_distances (user_id, club, carry_yards, updated_at)
         VALUES ($1, $2, $3, now())
         ON CONFLICT (user_id, club) DO UPDATE
           SET carry_yards = EXCLUDED.carry_yards, updated_at = now()`,
        [userId, name, Math.round(carry)]
      );
      accepted.clubs += 1;
    }

    for (const shot of shots) {
      const id = String(shot.id || `${shot.time}-${shot.club}-${shot.distanceYards}`).slice(0, 120);
      const playedAt = normalizeTimestamp(shot.time);
      const distance = Number(shot.distanceYards);

      if (!id || !playedAt || !shot.club || !Number.isFinite(distance) || distance < 1 || distance > 500) {
        continue;
      }

      await client.query(
        `INSERT INTO shots (id, user_id, played_at, course_name, hole, par, club, distance_yards, result, lie, direction)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (user_id, id) DO NOTHING`,
        [
          id,
          userId,
          playedAt,
          String(shot.courseName || "").slice(0, 160),
          boundedInteger(shot.hole, 1, 18),
          boundedInteger(shot.par, 3, 6),
          String(shot.club).slice(0, 60),
          Math.round(distance),
          String(shot.result || "").slice(0, 20),
          String(shot.lie || "").slice(0, 20),
          String(shot.direction || "").slice(0, 20)
        ]
      );
      accepted.shots += 1;
    }

    for (const round of rounds) {
      const id = String(round.id || "").slice(0, 120);
      const finishedAt = normalizeTimestamp(round.finishedAt);
      const encoded = encodeRoundData(round);

      if (!id || !finishedAt || !encoded) {
        continue;
      }

      await client.query(
        `INSERT INTO rounds (id, user_id, course_name, tee_name, total_holes, finished_at, players, hole_pars, scores, hole_stats, totals)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (user_id, id) DO UPDATE SET
           course_name = EXCLUDED.course_name,
           tee_name = EXCLUDED.tee_name,
           total_holes = EXCLUDED.total_holes,
           finished_at = EXCLUDED.finished_at,
           players = EXCLUDED.players,
           hole_pars = EXCLUDED.hole_pars,
           scores = EXCLUDED.scores,
           hole_stats = EXCLUDED.hole_stats,
           totals = EXCLUDED.totals`,
        [
          id,
          userId,
          String(round.courseName || "").slice(0, 160),
          String(round.teeName || "").slice(0, 60),
          round.totalHoles === 9 ? 9 : 18,
          finishedAt,
          encoded.players,
          encoded.holePars,
          encoded.scores,
          encoded.holeStats,
          encoded.totals
        ]
      );
      accepted.rounds += 1;
    }

    for (const course of courses) {
      const id = String(course.id || "").slice(0, 120);
      const courseName = String(course.courseName || "").slice(0, 160).trim();
      const encoded = encodeCourseData(course);

      if (!id || !courseName || !encoded) {
        continue;
      }

      await client.query(
        `INSERT INTO courses (user_id, id, course_name, tee_name, total_holes, hole_pars, hole_lengths, hole_targets, hole_hazards, source, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now())
         ON CONFLICT (user_id, id) DO UPDATE SET
           course_name = EXCLUDED.course_name,
           tee_name = EXCLUDED.tee_name,
           total_holes = EXCLUDED.total_holes,
           hole_pars = EXCLUDED.hole_pars,
           hole_lengths = EXCLUDED.hole_lengths,
           hole_targets = EXCLUDED.hole_targets,
           hole_hazards = EXCLUDED.hole_hazards,
           source = EXCLUDED.source,
           updated_at = now()`,
        [
          userId,
          id,
          courseName,
          String(course.teeName || "").slice(0, 60),
          course.totalHoles === 9 ? 9 : 18,
          encoded.holePars,
          encoded.holeLengths,
          encoded.holeTargets,
          encoded.holeHazards,
          String(course.source || "manual").slice(0, 40)
        ]
      );
      accepted.courses += 1;
    }

    await pruneUserData(client, userId);
    await client.query("COMMIT");
    return accepted;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

function normalizeTimestamp(value) {
  const date = new Date(value);

  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function boundedInteger(value, minimum, maximum) {
  const number = Number(value);

  return Number.isInteger(number) && number >= minimum && number <= maximum ? number : null;
}

function encodeJsonWithinLimit(value, fallback, maxBytes) {
  const encoded = JSON.stringify(value === undefined ? fallback : value);

  return Buffer.byteLength(encoded) <= maxBytes ? encoded : null;
}

function encodeRoundData(round) {
  const fields = {
    players: encodeJsonWithinLimit(round.players, [], 8 * 1024),
    holePars: encodeJsonWithinLimit(round.holePars, {}, 8 * 1024),
    scores: encodeJsonWithinLimit(round.scores, {}, 32 * 1024),
    holeStats: encodeJsonWithinLimit(round.holeStats, {}, 32 * 1024),
    totals: encodeJsonWithinLimit(round.totals, [], 8 * 1024)
  };

  return Object.values(fields).every(Boolean) ? fields : null;
}

function encodeCourseData(course) {
  const fields = {
    holePars: encodeJsonWithinLimit(course.holePars, {}, 8 * 1024),
    holeLengths: encodeJsonWithinLimit(course.holeLengths, {}, 8 * 1024),
    holeTargets: encodeJsonWithinLimit(course.holeTargets, {}, 48 * 1024),
    holeHazards: encodeJsonWithinLimit(course.holeHazards, {}, 48 * 1024)
  };

  return Object.values(fields).every(Boolean) ? fields : null;
}

async function pruneUserData(client, userId) {
  await client.query(
    `DELETE FROM club_distances
     WHERE user_id = $1 AND club IN (
       SELECT club FROM club_distances WHERE user_id = $1
       ORDER BY updated_at DESC OFFSET 40
     )`,
    [userId]
  );
  await client.query(
    `DELETE FROM shots
     WHERE user_id = $1 AND id IN (
       SELECT id FROM shots WHERE user_id = $1
       ORDER BY played_at DESC OFFSET 1000
     )`,
    [userId]
  );
  await client.query(
    `DELETE FROM rounds
     WHERE user_id = $1 AND id IN (
       SELECT id FROM rounds WHERE user_id = $1
       ORDER BY finished_at DESC OFFSET 200
     )`,
    [userId]
  );
  await client.query(
    `DELETE FROM courses
     WHERE user_id = $1 AND id IN (
       SELECT id FROM courses WHERE user_id = $1
       ORDER BY updated_at DESC OFFSET 200
     )`,
    [userId]
  );
}

export async function pullUserData(userId) {
  const [clubs, shots, rounds, courses] = await Promise.all([
    query(`SELECT club, carry_yards FROM club_distances WHERE user_id = $1 ORDER BY carry_yards DESC`, [userId]),
    query(`SELECT id, played_at, course_name, hole, par, club, distance_yards, result, lie, direction
           FROM shots WHERE user_id = $1 ORDER BY played_at ASC LIMIT 1000`, [userId]),
    query(`SELECT id, course_name, tee_name, total_holes, finished_at, players, hole_pars, scores, hole_stats, totals
           FROM rounds WHERE user_id = $1 ORDER BY finished_at ASC LIMIT 200`, [userId]),
    query(`SELECT id, course_name, tee_name, total_holes, hole_pars, hole_lengths, hole_targets, hole_hazards, source
           FROM courses WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 200`, [userId])
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
