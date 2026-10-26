import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { timingSafeEqual } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  isDatabaseConfigured,
  initializeSchema,
  createLoginLink,
  redeemLoginLink,
  getUserForSession,
  deleteSession,
  deleteUser,
  pushUserData,
  pullUserData,
  normalizeEmail,
  isValidEmail
} from "./db.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadDotEnv();

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";
const model = process.env.OPENAI_MODEL || "gpt-5-mini";
const golfApiBaseUrl = process.env.GOLFAPI_BASE_URL || "https://golfapi.io/api/v2.3";
const allowedGolfApiResources = new Set(["clubs", "courses", "coordinates"]);

const accessToken = String(process.env.APP_ACCESS_TOKEN || "").trim();
const adminToken = String(process.env.ADMIN_TOKEN || "").trim();
const rateLimits = {
  ai: {
    windowMs: 5 * 60 * 1000,
    windowLimit: Number(process.env.AI_WINDOW_REQUEST_LIMIT || 30),
    dailyLimit: Number(process.env.AI_DAILY_REQUEST_LIMIT || 400),
    globalDailyLimit: Number(process.env.AI_GLOBAL_DAILY_LIMIT || 1500)
  },
  golfapi: {
    windowMs: 5 * 60 * 1000,
    windowLimit: Number(process.env.GOLFAPI_WINDOW_REQUEST_LIMIT || 60),
    dailyLimit: Number(process.env.GOLFAPI_DAILY_REQUEST_LIMIT || 600),
    globalDailyLimit: Number(process.env.GOLFAPI_GLOBAL_DAILY_LIMIT || 2000)
  }
};
const rateLimitBuckets = new Map();
const dailyCounters = new Map();
const globalDailyCounters = { ai: 0, golfapi: 0 };
let dailyCounterDay = currentUtcDay();
let apiPaused = String(process.env.API_PAUSED || "").trim().toLowerCase() === "true";
let pausedReason = apiPaused ? "Paused at startup by API_PAUSED." : "";
const golfApiCache = new Map();
const GOLFAPI_CACHE_MAX_ENTRIES = 120;
const GOLFAPI_CACHE_MAX_BYTES = 1024 * 1024;

const publicFiles = new Set([
  "index.html",
  "app.js",
  "style.css",
  "manifest.webmanifest",
  "service-worker.js",
  "make-icons.html",
  "privacy.html",
  "terms.html"
]);
const publicDirectories = new Set(["icons"]);

const mimeTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".mjs": "text/javascript",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json"
};

createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    if (req.method === "GET" && url.pathname === "/api/health") {
      sendJson(res, 200, {
        ok: true,
        model,
        openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
        golfApiConfigured: Boolean(process.env.GOLFAPI_API_KEY),
        accessTokenRequired: accessToken !== "",
        paused: apiPaused,
        accountsEnabled: isDatabaseConfigured()
      });
      return;
    }

    if (url.pathname.startsWith("/api/account")) {
      await handleAccountRequest(req, res, url);
      return;
    }

    if (req.method === "GET" && url.pathname === "/signin") {
      await handleSignInRedemption(req, res, url);
      return;
    }

    if (url.pathname === "/api/admin/usage") {
      await handleAdminRequest(req, res);
      return;
    }

    if (req.method === "GET" && url.pathname.startsWith("/api/golfapi/")) {
      if (!allowApiRequest(req, res, "golfapi")) {
        return;
      }

      await handleGolfApiRequest(url, res);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/voice-agent") {
      if (!allowApiRequest(req, res, "ai")) {
        return;
      }

      await handleVoiceAgentRequest(req, res);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/transcribe") {
      if (!allowApiRequest(req, res, "ai")) {
        return;
      }

      await handleTranscriptionRequest(req, res);
      return;
    }

    if (req.method !== "GET") {
      sendJson(res, 405, { error: "Method not allowed." });
      return;
    }

    await serveStaticFile(url.pathname, res);
  } catch (error) {
    console.error("Server error:", error);
    sendJson(res, 500, { error: "Internal server error." });
  }
}).listen(port, host, () => {
  console.log(`Golf Assistant running at http://${host}:${port}/`);
  console.log(`On this computer: http://127.0.0.1:${port}/`);
  console.log("On your phone: use this computer's Wi-Fi IPv4 address with the same port.");

  if (accessToken) {
    console.log("Access control: APP_ACCESS_TOKEN is set. Clients must send a matching access code.");
  } else {
    console.warn("Access control: APP_ACCESS_TOKEN is not set. The AI and GOLFAPI endpoints are open to anyone who can reach this server.");
  }

  console.log(`Per-client limits: AI ${rateLimits.ai.windowLimit}/5 min and ${rateLimits.ai.dailyLimit}/day; GOLFAPI ${rateLimits.golfapi.windowLimit}/5 min and ${rateLimits.golfapi.dailyLimit}/day.`);
  console.log(`Server-wide daily ceilings: AI ${rateLimits.ai.globalDailyLimit}; GOLFAPI ${rateLimits.golfapi.globalDailyLimit}.`);

  if (adminToken) {
    console.log("Admin control: GET/POST /api/admin/usage with the x-admin-token header reports usage and pauses or resumes the AI endpoints.");
  } else {
    console.warn("Admin control: ADMIN_TOKEN is not set, so the remote pause switch is disabled. Set it to pause spending without a redeploy.");
  }

  if (apiPaused) {
    console.warn("Admin control: the AI and GOLFAPI endpoints start paused because API_PAUSED is true.");
  }

  if (isDatabaseConfigured()) {
    initializeSchema()
      .then(() => console.log("Accounts: DATABASE_URL is set and the schema is ready. Sign-in and sync are available."))
      .catch(error => console.error("Accounts: schema setup failed:", error.message));
  } else {
    console.log("Accounts: DATABASE_URL is not set, so the app runs in device-only mode with no sign-in or sync.");
  }
});

function allowApiRequest(req, res, limitName) {
  if (!hasValidAccessToken(req)) {
    sendJson(res, 401, {
      code: "access_code_required",
      error: "This app needs an access code. Open Settings and enter the access code for this server."
    });
    return false;
  }

  if (apiPaused) {
    sendJson(res, 503, {
      code: "service_paused",
      error: "The caddie service is paused right now. Scoring, the scorecard, and saved course data still work."
    });
    return false;
  }

  const limitResult = checkRateLimit(getClientKey(req), limitName);

  if (!limitResult.allowed) {
    res.setHeader("Retry-After", String(limitResult.retryAfterSeconds));
    sendJson(res, 429, {
      code: limitResult.scope === "server" ? "server_budget_reached" : "rate_limited",
      error: describeLimit(limitResult.scope)
    });
    return false;
  }

  return true;
}

function describeLimit(scope) {
  if (scope === "server") {
    return "This server hit its daily budget for caddie requests. Scoring and saved course data still work, and the budget resets at midnight UTC.";
  }

  if (scope === "day") {
    return "Daily request limit reached for this device. Try again tomorrow.";
  }

  return "Too many requests in a short time. Wait a moment and ask again.";
}

async function handleAccountRequest(req, res, url) {
  if (!isDatabaseConfigured()) {
    sendJson(res, 501, {
      code: "accounts_disabled",
      error: "This server runs in device-only mode. Your data stays in this browser."
    });
    return;
  }

  const route = url.pathname.replace("/api/account", "") || "/";

  try {
    if (req.method === "POST" && route === "/login-link") {
      await handleLoginLinkRequest(req, res, url);
      return;
    }

    const user = await getUserForSession(readSessionCookie(req));

    if (req.method === "GET" && route === "/") {
      sendJson(res, 200, user ? { signedIn: true, email: user.email } : { signedIn: false });
      return;
    }

    if (req.method === "POST" && route === "/signout") {
      await deleteSession(readSessionCookie(req));
      res.setHeader("Set-Cookie", buildSessionCookie("", 0));
      sendJson(res, 200, { signedIn: false });
      return;
    }

    if (!user) {
      sendJson(res, 401, { code: "signin_required", error: "Sign in to use sync." });
      return;
    }

    if (req.method === "POST" && route === "/sync") {
      const body = await readJsonBody(req, 2 * 1024 * 1024);
      const pushed = await pushUserData(user.id, body || {});
      const data = await pullUserData(user.id);

      sendJson(res, 200, { pushed, data, syncedAt: new Date().toISOString() });
      return;
    }

    if (req.method === "GET" && route === "/export") {
      const data = await pullUserData(user.id);

      res.setHeader("Content-Disposition", `attachment; filename="golf-assistant-account.json"`);
      sendJson(res, 200, { email: user.email, exportedAt: new Date().toISOString(), data });
      return;
    }

    if (req.method === "DELETE" && route === "/") {
      await deleteUser(user.id);
      res.setHeader("Set-Cookie", buildSessionCookie("", 0));
      sendJson(res, 200, { deleted: true });
      return;
    }

    sendJson(res, 404, { error: "Unknown account route." });
  } catch (error) {
    console.error("Account request failed:", error.message);
    sendJson(res, 500, { error: "That account request could not be completed." });
  }
}

async function handleLoginLinkRequest(req, res, url) {
  let body;

  try {
    body = await readJsonBody(req, 4 * 1024);
  } catch (error) {
    sendJson(res, 400, { error: error.message });
    return;
  }

  const email = normalizeEmail(body && body.email);

  if (!isValidEmail(email)) {
    sendJson(res, 400, { error: "Enter a valid email address." });
    return;
  }

  if (!checkRateLimit(getClientKey(req), "ai").allowed) {
    sendJson(res, 429, { error: "Too many sign-in attempts. Wait a moment and try again." });
    return;
  }

  const { token, minutes } = await createLoginLink(email);
  const link = `${url.origin}/signin?token=${token}`;
  const delivered = await sendLoginEmail(email, link, minutes);

  if (!delivered) {
    console.log(`Sign-in link for ${email} (valid ${minutes} minutes): ${link}`);
  }

  sendJson(res, 200, {
    sent: true,
    delivery: delivered ? "email" : "server_log",
    message: delivered
      ? `Check ${email} for a sign-in link. It expires in ${minutes} minutes.`
      : `Email delivery is not configured on this server, so the link was written to the server log. It expires in ${minutes} minutes.`
  });
}

async function sendLoginEmail(email, link, minutes) {
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const from = String(process.env.LOGIN_EMAIL_FROM || "").trim();

  if (!apiKey || !from) {
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Your Golf Assistant sign-in link",
        text: `Tap this link to sign in. It expires in ${minutes} minutes.\n\n${link}\n\nIf you did not request this, ignore this email.`
      })
    });

    if (!response.ok) {
      console.error("Sign-in email failed:", response.status, (await response.text()).slice(0, 200));
      return false;
    }

    return true;
  } catch (error) {
    console.error("Sign-in email error:", error.message);
    return false;
  }
}

async function handleSignInRedemption(req, res, url) {
  if (!isDatabaseConfigured()) {
    sendText(res, 404, "Not found", "text/plain");
    return;
  }

  const token = url.searchParams.get("token") || "";

  try {
    const result = await redeemLoginLink(token);

    if (!result) {
      res.writeHead(303, { Location: "/index.html?signin=expired" });
      res.end();
      return;
    }

    res.writeHead(303, {
      "Set-Cookie": buildSessionCookie(result.sessionToken, 90 * 24 * 60 * 60),
      Location: "/index.html?signin=ok"
    });
    res.end();
  } catch (error) {
    console.error("Sign-in redemption failed:", error.message);
    res.writeHead(303, { Location: "/index.html?signin=error" });
    res.end();
  }
}

function buildSessionCookie(value, maxAgeSeconds) {
  const parts = [
    `golf_session=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`
  ];

  if (process.env.COOKIE_INSECURE !== "true") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function readSessionCookie(req) {
  const header = String(req.headers.cookie || "");
  const match = header.split(";").map(part => part.trim()).find(part => part.startsWith("golf_session="));

  return match ? match.slice("golf_session=".length) : "";
}

async function handleAdminRequest(req, res) {
  if (!adminToken) {
    sendJson(res, 404, { error: "Admin controls are not enabled on this server." });
    return;
  }

  const provided = String(req.headers["x-admin-token"] || "").trim();
  const matches = provided.length === adminToken.length &&
    timingSafeEqual(Buffer.from(provided), Buffer.from(adminToken));

  if (!matches) {
    sendJson(res, 401, { error: "Admin token required." });
    return;
  }

  if (req.method === "POST") {
    let body;

    try {
      body = await readJsonBody(req, 4 * 1024);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      return;
    }

    if (typeof body.paused !== "boolean") {
      sendJson(res, 400, { error: "Send { \"paused\": true } or { \"paused\": false }." });
      return;
    }

    apiPaused = body.paused;
    pausedReason = apiPaused
      ? String(body.reason || "Paused through the admin endpoint.")
      : "";

    console.warn(`Admin control: AI and GOLFAPI endpoints ${apiPaused ? "paused" : "resumed"}.`);
  } else if (req.method !== "GET") {
    sendJson(res, 405, { error: "Use GET to read usage or POST to pause and resume." });
    return;
  }

  rollDailyCountersIfNeeded();

  sendJson(res, 200, {
    paused: apiPaused,
    pausedReason: pausedReason,
    utcDay: dailyCounterDay,
    secondsUntilReset: secondsUntilUtcMidnight(),
    usage: {
      ai: { today: globalDailyCounters.ai, dailyCeiling: rateLimits.ai.globalDailyLimit },
      golfapi: { today: globalDailyCounters.golfapi, dailyCeiling: rateLimits.golfapi.globalDailyLimit }
    },
    perClientLimits: {
      ai: { perWindow: rateLimits.ai.windowLimit, perDay: rateLimits.ai.dailyLimit },
      golfapi: { perWindow: rateLimits.golfapi.windowLimit, perDay: rateLimits.golfapi.dailyLimit }
    },
    note: "Counters live in server memory and reset on restart or at midnight UTC."
  });
}

function hasValidAccessToken(req) {
  if (!accessToken) {
    return true;
  }

  const provided = String(req.headers["x-app-token"] || "").trim();

  if (provided.length !== accessToken.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(provided), Buffer.from(accessToken));
}

function getClientKey(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();

  return forwarded || req.socket.remoteAddress || "unknown";
}

function checkRateLimit(clientKey, limitName) {
  const limit = rateLimits[limitName];
  const now = Date.now();

  rollDailyCountersIfNeeded();

  if (globalDailyCounters[limitName] >= limit.globalDailyLimit) {
    return { allowed: false, scope: "server", retryAfterSeconds: secondsUntilUtcMidnight() };
  }

  const dailyKey = `${limitName}:${clientKey}`;
  const dailyCount = dailyCounters.get(dailyKey) || 0;

  if (dailyCount >= limit.dailyLimit) {
    return { allowed: false, scope: "day", retryAfterSeconds: secondsUntilUtcMidnight() };
  }

  const windowKey = `${limitName}:${clientKey}`;
  const timestamps = (rateLimitBuckets.get(windowKey) || []).filter(time => {
    return now - time < limit.windowMs;
  });

  if (timestamps.length >= limit.windowLimit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((limit.windowMs - (now - timestamps[0])) / 1000));

    rateLimitBuckets.set(windowKey, timestamps);
    return { allowed: false, scope: "window", retryAfterSeconds };
  }

  timestamps.push(now);
  rateLimitBuckets.set(windowKey, timestamps);
  dailyCounters.set(dailyKey, dailyCount + 1);
  globalDailyCounters[limitName] += 1;
  pruneRateLimitBuckets(now);

  return { allowed: true };
}

function rollDailyCountersIfNeeded() {
  const today = currentUtcDay();

  if (today !== dailyCounterDay) {
    dailyCounterDay = today;
    dailyCounters.clear();
    globalDailyCounters.ai = 0;
    globalDailyCounters.golfapi = 0;
  }
}

function secondsUntilUtcMidnight() {
  const now = new Date();
  const midnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);

  return Math.max(1, Math.ceil((midnight - now.getTime()) / 1000));
}

function pruneRateLimitBuckets(now) {
  if (rateLimitBuckets.size < 500) {
    return;
  }

  rateLimitBuckets.forEach((timestamps, key) => {
    const limitName = key.split(":")[0];
    const windowMs = (rateLimits[limitName] || rateLimits.ai).windowMs;
    const active = timestamps.filter(time => now - time < windowMs);

    if (active.length === 0) {
      rateLimitBuckets.delete(key);
    } else {
      rateLimitBuckets.set(key, active);
    }
  });
}

function currentUtcDay() {
  return new Date().toISOString().slice(0, 10);
}

async function handleVoiceAgentRequest(req, res) {
  if (!process.env.OPENAI_API_KEY) {
    sendJson(res, 503, {
      error: "OpenAI API key is not configured. Add OPENAI_API_KEY to .env, then restart the server."
    });
    return;
  }

  let body;

  try {
    body = await readJsonBody(req, 256 * 1024);
  } catch (error) {
    sendJson(res, 400, { error: error.message });
    return;
  }

  const { transcript, round, client } = body || {};

  if (typeof transcript !== "string" || transcript.trim() === "") {
    sendJson(res, 400, { error: "A transcript is required." });
    return;
  }

  if (!round || !Array.isArray(round.players)) {
    sendJson(res, 400, { error: "A valid round state is required." });
    return;
  }

  try {
    const agentResponse = await callVoiceAgent({
      transcript: transcript.trim(),
      round: sanitizeRound(round),
      client: client || {}
    });

    sendJson(res, 200, agentResponse);
  } catch (error) {
    console.error("Voice agent error:", error);
    sendJson(res, 502, {
      error: "The AI voice agent could not process that request."
    });
  }
}

async function handleTranscriptionRequest(req, res) {
  if (!process.env.OPENAI_API_KEY) {
    sendJson(res, 503, {
      error: "OpenAI API key is not configured. Add OPENAI_API_KEY to .env, then restart the server."
    });
    return;
  }

  let audioBuffer;

  try {
    audioBuffer = await readRawBody(req, 12 * 1024 * 1024);
  } catch (error) {
    sendJson(res, 400, { error: error.message });
    return;
  }

  if (!audioBuffer.length) {
    sendJson(res, 400, { error: "Audio is required." });
    return;
  }

  try {
    const transcript = await transcribeAudio({
      audioBuffer,
      contentType: req.headers["content-type"] || "audio/webm"
    });

    sendJson(res, 200, { transcript });
  } catch (error) {
    console.error("Transcription error:", error);
    sendJson(res, 502, {
      error: "The audio could not be transcribed."
    });
  }
}

async function handleGolfApiRequest(url, res) {
  if (!process.env.GOLFAPI_API_KEY) {
    sendJson(res, 503, {
      error: "GOLFAPI key is not configured. Add GOLFAPI_API_KEY to .env, then restart the server."
    });
    return;
  }

  const pathParts = url.pathname
    .replace("/api/golfapi/", "")
    .split("/")
    .map(part => part.trim())
    .filter(Boolean);
  const resource = pathParts[0] || "";
  const resourceId = pathParts[1] || "";

  if (!allowedGolfApiResources.has(resource) || pathParts.length > 2) {
    sendJson(res, 404, { error: "Unknown GOLFAPI resource." });
    return;
  }

  if (resourceId && !/^[A-Za-z0-9_-]+$/.test(resourceId)) {
    sendJson(res, 400, { error: "Invalid GOLFAPI resource ID." });
    return;
  }

  const upstreamPath = resourceId ? `${resource}/${resourceId}` : resource;
  const upstreamUrl = new URL(`${golfApiBaseUrl.replace(/\/+$/g, "")}/${upstreamPath}`);

  url.searchParams.forEach((value, key) => {
    if (value !== "") {
      upstreamUrl.searchParams.set(key, value);
    }
  });

  const cacheKey = upstreamUrl.toString();
  const cached = readGolfApiCache(cacheKey);

  if (cached) {
    sendText(res, 200, cached.body, cached.contentType);
    return;
  }

  try {
    const response = await fetch(upstreamUrl, {
      headers: {
        "Authorization": `Bearer ${process.env.GOLFAPI_API_KEY}`,
        "Accept": "application/json"
      }
    });

    const bodyText = await response.text();

    if (!response.ok) {
      let message = "GOLFAPI request failed.";

      try {
        const body = JSON.parse(bodyText);
        message = body.message || body.error || message;
      } catch {
        if (bodyText) {
          message = bodyText;
        }
      }

      sendJson(res, response.status, { error: message });
      return;
    }

    const contentType = response.headers.get("content-type") || "application/json";
    const body = bodyText || "{}";

    writeGolfApiCache(cacheKey, resource, body, contentType);
    sendText(res, 200, body, contentType);
  } catch (error) {
    console.error("GOLFAPI proxy error:", error);
    sendJson(res, 502, { error: "Could not reach GOLFAPI." });
  }
}

function readGolfApiCache(key) {
  const entry = golfApiCache.get(key);

  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    golfApiCache.delete(key);
    return null;
  }

  return entry;
}

function writeGolfApiCache(key, resource, body, contentType) {
  if (body.length > GOLFAPI_CACHE_MAX_BYTES) {
    return;
  }

  if (golfApiCache.size >= GOLFAPI_CACHE_MAX_ENTRIES) {
    golfApiCache.delete(golfApiCache.keys().next().value);
  }

  const ttlMs = resource === "clubs" ? 30 * 60 * 1000 : 12 * 60 * 60 * 1000;

  golfApiCache.set(key, {
    body: body,
    contentType: contentType,
    expiresAt: Date.now() + ttlMs
  });
}

async function serveStaticFile(pathname, res) {
  let decodedPath;

  try {
    decodedPath = decodeURIComponent(pathname.slice(1));
  } catch {
    sendText(res, 400, "Bad request", "text/plain");
    return;
  }

  const assetPath = (decodedPath.replace(/\\/g, "/") || "index.html");

  if (!isPublicAssetPath(assetPath)) {
    sendText(res, 404, "Not found", "text/plain");
    return;
  }

  const requestedPath = path.join(__dirname, assetPath);
  const pathFromRoot = path.relative(__dirname, requestedPath);

  if (pathFromRoot === "" || pathFromRoot.startsWith("..") || path.isAbsolute(pathFromRoot)) {
    sendText(res, 404, "Not found", "text/plain");
    return;
  }

  try {
    const body = await readFile(requestedPath);
    sendBuffer(res, 200, body, mimeTypes[path.extname(requestedPath)] || "application/octet-stream");
  } catch {
    sendText(res, 404, "Not found", "text/plain");
  }
}

function isPublicAssetPath(assetPath) {
  const segments = assetPath.split("/");

  if (segments.some(segment => segment === "" || segment === "." || segment === ".." || segment.startsWith("."))) {
    return false;
  }

  if (segments.length === 1) {
    return publicFiles.has(segments[0]);
  }

  if (segments.length === 2) {
    return publicDirectories.has(segments[0]) &&
      Object.hasOwn(mimeTypes, path.extname(segments[1]));
  }

  return false;
}

async function callVoiceAgent(context) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      instructions: buildAgentInstructions(),
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify(context)
            }
          ]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "golf_voice_agent_response",
          strict: true,
          schema: voiceAgentSchema
        }
      }
    })
  });

  const bodyText = await response.text();

  if (!response.ok) {
    throw new Error(`OpenAI API ${response.status}: ${bodyText}`);
  }

  const body = JSON.parse(bodyText);
  const outputText = extractOutputText(body);

  if (!outputText) {
    throw new Error("No structured output text returned by the model.");
  }

  return JSON.parse(outputText);
}

async function transcribeAudio({ audioBuffer, contentType }) {
  const safeContentType = String(contentType).split(";")[0] || "audio/webm";
  const extension = getAudioFileExtension(safeContentType);
  const formData = new FormData();

  formData.append("model", process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-mini-transcribe");
  formData.append("file", new Blob([audioBuffer], { type: safeContentType }), `voice-command.${extension}`);

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: formData
  });

  const bodyText = await response.text();

  if (!response.ok) {
    throw new Error(`OpenAI transcription API ${response.status}: ${bodyText}`);
  }

  const body = JSON.parse(bodyText);

  if (typeof body.text !== "string") {
    throw new Error("No transcript text returned by the transcription model.");
  }

  return body.text.trim();
}

function getAudioFileExtension(contentType) {
  if (contentType.includes("mp4")) {
    return "mp4";
  }

  if (contentType.includes("mpeg")) {
    return "mp3";
  }

  if (contentType.includes("ogg")) {
    return "ogg";
  }

  if (contentType.includes("wav")) {
    return "wav";
  }

  return "webm";
}

function extractOutputText(responseBody) {
  if (typeof responseBody.output_text === "string") {
    return responseBody.output_text;
  }

  if (!Array.isArray(responseBody.output)) {
    return "";
  }

  const textParts = [];

  for (const item of responseBody.output) {
    if (!Array.isArray(item.content)) {
      continue;
    }

    for (const content of item.content) {
      if (typeof content.text === "string") {
        textParts.push(content.text);
      }
    }
  }

  return textParts.join("");
}

function sanitizeRound(round) {
  return {
    courseName: String(round.courseName || ""),
    players: Array.isArray(round.players) ? round.players.map(player => String(player)) : [],
    totalHoles: Number(round.totalHoles || 18),
    currentHole: Number(round.currentHole || 1),
    scores: round.scores || {},
    holePars: round.holePars || {},
    holeLengths: round.holeLengths || {},
    currentHoleContext: round.currentHoleContext || {},
    playerClubProfile: round.playerClubProfile || {}
  };
}

function buildAgentInstructions() {
  return [
    "You are a golf round voice agent and practical on-course caddie for a manual scorecard app.",
    "Interpret the user's natural language using only the supplied round JSON.",
    "Return exactly one JSON object that matches the schema. Do not include markdown.",
    "Prefer direct, concise messages suitable for both screen display and text-to-speech.",
    "When the user says I, me, my, or myself, treat that as the first player in round.players.",
    "Use start_round when the user wants to begin a round and clearly gives a course name plus at least one player. If players are not clear, use clarify.",
    "Use end_round when the user wants to finish, end, close, or complete the active round. This saves and summarizes; it does not delete the round.",
    "For score language, par means the hole par, birdie means par minus 1, bogey means par plus 1, double bogey means par plus 2, eagle means par minus 2.",
    "Only choose a mutating action when the player, hole, and value are clear.",
    "Use clarify for ambiguous player names, unclear holes, or unclear score values.",
    "Use recommend_club when the user asks what club to hit, what shot to play, how to attack a hole, lay up or go for it, or asks for caddie advice.",
    "For recommend_club, include any explicit distance in payload.distanceYards. If no distance is stated, leave it 0 and the browser will use GPS/course data when possible.",
    "For recommend_club, give advice like a real caddie: club, target, miss preference, and one clear swing/shot thought. Mention uncertainty when wind, lie, elevation, or pin location are unknown.",
    "When round.playerClubProfile.status is configured, choose payload.recommendedClub from that club list using its carryYards, preferring the shortest club that still covers the distance. Say when a club distance came from the golfer's logged shots. When the profile is not configured, say the call is a general estimate.",
    "Do not answer club recommendation requests with the player's score, total score, or only the raw distance.",
    "Use get_green_yardage only when the user directly asks how far, yardage, or distance to the green. The browser will handle GPS.",
    "Use get_hazard_distance only when the user directly asks distance to a named hazard or target.",
    "Use unknown only when the request is unrelated to this golf round."
  ].join("\n");
}

function readJsonBody(req, maxBytes) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    req.on("data", chunk => {
      size += chunk.length;

      if (size > maxBytes) {
        reject(new Error("Request body is too large."));
        req.destroy();
        return;
      }

      chunks.push(chunk);
    });

    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Request body must be valid JSON."));
      }
    });

    req.on("error", reject);
  });
}

function readRawBody(req, maxBytes) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    req.on("data", chunk => {
      size += chunk.length;

      if (size > maxBytes) {
        reject(new Error("Audio is too large."));
        req.destroy();
        return;
      }

      chunks.push(chunk);
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    req.on("error", reject);
  });
}

function sendJson(res, status, value) {
  sendText(res, status, JSON.stringify(value), "application/json");
}

function sendText(res, status, text, contentType) {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Cache-Control": "no-store"
  });
  res.end(text);
}

function sendBuffer(res, status, body, contentType) {
  res.writeHead(status, {
    "Content-Type": contentType
  });
  res.end(body);
}

function loadDotEnv() {
  const envPath = path.join(__dirname, ".env");

  if (!existsSync(envPath)) {
    return;
  }

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

const voiceAgentSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    action: {
      type: "string",
      enum: [
        "start_round",
        "end_round",
        "save_scores",
        "change_score",
        "set_par",
        "go_to_hole",
        "answer_question",
        "recommend_club",
        "get_green_yardage",
        "get_hazard_distance",
        "clarify",
        "unknown"
      ]
    },
    confidence: {
      type: "number",
      minimum: 0,
      maximum: 1
    },
    payload: {
      type: "object",
      additionalProperties: false,
      properties: {
        scores: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              player: { type: "string" },
              score: { type: "integer", minimum: 1, maximum: 20 },
              hole: { type: "integer", minimum: 1, maximum: 18 }
            },
            required: ["player", "score", "hole"]
          }
        },
        player: { type: "string" },
        score: { type: "integer", minimum: 1, maximum: 20 },
        hole: { type: "integer", minimum: 1, maximum: 18 },
        par: { type: "integer", minimum: 3, maximum: 6 },
        courseName: { type: "string" },
        players: {
          type: "array",
          items: { type: "string" }
        },
        totalHoles: { type: "integer", enum: [0, 9, 18] },
        questionType: { type: "string" },
        targetName: { type: "string" },
        answer: { type: "string" },
        distanceYards: { type: "integer", minimum: 0, maximum: 700 },
        recommendedClub: { type: "string" },
        recommendationReason: { type: "string" },
        shotTarget: { type: "string" },
        missPreference: { type: "string" }
      },
      required: [
        "scores",
        "player",
        "score",
        "hole",
        "par",
        "courseName",
        "players",
        "totalHoles",
        "questionType",
        "targetName",
        "answer",
        "distanceYards",
        "recommendedClub",
        "recommendationReason",
        "shotTarget",
        "missPreference"
      ]
    },
    message: { type: "string" },
    speak: { type: "boolean" }
  },
  required: ["action", "confidence", "payload", "message", "speak"]
};
