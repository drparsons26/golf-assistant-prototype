import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { timingSafeEqual, createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  isDatabaseConfigured,
  initializeSchema,
  createLoginLink,
  redeemLoginLink,
  getUserForSession,
  setUserDisplayName,
  deleteSession,
  deleteUser,
  pushUserData,
  pullUserData,
  normalizeEmail,
  isValidEmail,
  consumeUsage,
  readUsageSummary,
  pruneUsageCounters
} from "./db.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadDotEnv();

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";
const model = process.env.OPENAI_MODEL || "gpt-5-mini";
const golfApiBaseUrl = process.env.GOLFAPI_BASE_URL || "https://golfapi.io/api/v2.3";
const allowedGolfApiResources = new Set(["clubs", "courses", "coordinates"]);
const allowedGolfApiParams = new Set(["city", "country", "name", "state", "measureUnit", "page", "limit"]);

const accessToken = String(process.env.APP_ACCESS_TOKEN || "").trim();
const accessCookieValue = accessToken
  ? createHash("sha256").update(accessToken).digest("base64url")
  : "";
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
  },
  // Open-Meteo is free and keyless, so these limits exist to be a good
  // neighbour to that service rather than to protect a bill.
  conditions: {
    windowMs: 5 * 60 * 1000,
    windowLimit: Number(process.env.CONDITIONS_WINDOW_REQUEST_LIMIT || 40),
    dailyLimit: Number(process.env.CONDITIONS_DAILY_REQUEST_LIMIT || 400),
    globalDailyLimit: Number(process.env.CONDITIONS_GLOBAL_DAILY_LIMIT || 4000)
  },
  // Sign-in and account traffic gets its own counters so a flood cannot
  // drain the AI budget that the paid endpoints depend on.
  auth: {
    windowMs: 15 * 60 * 1000,
    windowLimit: Number(process.env.AUTH_WINDOW_REQUEST_LIMIT || 12),
    dailyLimit: Number(process.env.AUTH_DAILY_REQUEST_LIMIT || 60),
    globalDailyLimit: Number(process.env.AUTH_GLOBAL_DAILY_LIMIT || 2000)
  }
};
const rateLimitBuckets = new Map();
const dailyCounters = new Map();
const globalDailyCounters = { ai: 0, golfapi: 0, auth: 0, conditions: 0 };
let dailyCounterDay = currentUtcDay();
let apiPaused = String(process.env.API_PAUSED || "").trim().toLowerCase() === "true";
let pausedReason = apiPaused ? "Paused at startup by API_PAUSED." : "";
// Accounts stay off until the schema actually initializes, so a database that
// is unreachable degrades to device-only mode instead of failing every call.
let accountsReady = false;
const golfApiCache = new Map();
const GOLFAPI_CACHE_MAX_ENTRIES = 120;
const GOLFAPI_CACHE_MAX_BYTES = 1024 * 1024;
const GOLFAPI_RESPONSE_MAX_BYTES = 4 * 1024 * 1024;

const publicFiles = new Set([
  "index.html",
  "app.js",
  "style.css",
  "manifest.webmanifest",
  "service-worker.js",
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
      // Only what the browser needs to render itself; model and provider-key
      // state are operator information, not public reconnaissance material.
      sendJson(res, 200, {
        ok: true,
        accessTokenRequired: accessToken !== "",
        accessGranted: hasValidAccessToken(req),
        paused: apiPaused,
        accountsEnabled: accountsReady
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/access") {
      await handleAccessCodeRequest(req, res);
      return;
    }

    if (url.pathname.startsWith("/api/account")) {
      await handleAccountRequest(req, res, url);
      return;
    }

    if ((req.method === "GET" || req.method === "POST") && url.pathname === "/signin") {
      await handleSignInRedemption(req, res, url);
      return;
    }

    if (url.pathname === "/api/admin/usage") {
      await handleAdminRequest(req, res);
      return;
    }

    if (req.method === "GET" && url.pathname.startsWith("/api/golfapi/")) {
      if (!await allowApiRequest(req, res, "golfapi")) {
        return;
      }

      await handleGolfApiRequest(url, res);
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/conditions") {
      if (!await allowApiRequest(req, res, "conditions")) {
        return;
      }

      await handleConditionsRequest(url, res);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/voice-agent") {
      if (!await allowApiRequest(req, res, "ai")) {
        return;
      }

      await handleVoiceAgentRequest(req, res);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/transcribe") {
      if (!await allowApiRequest(req, res, "ai")) {
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
      .then(() => {
        accountsReady = true;
        console.log("Accounts: DATABASE_URL is set and the schema is ready. Sign-in and sync are available.");
      })
      .catch(error => {
        accountsReady = false;
        console.error("Accounts: schema setup failed, so sign-in and sync stay disabled:", error.message);
      });
  } else {
    console.log("Accounts: DATABASE_URL is not set, so the app runs in device-only mode with no sign-in or sync.");
  }
});

async function allowApiRequest(req, res, limitName) {
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

  const clientKey = getClientKey(req);
  const windowResult = checkWindowLimit(clientKey, limitName);

  if (!windowResult.allowed) {
    denyApiRequest(res, windowResult);
    return false;
  }

  const dailyResult = await claimDailyAllowance(req, clientKey, limitName);

  if (!dailyResult.allowed) {
    denyApiRequest(res, dailyResult);
    return false;
  }

  return true;
}

function denyApiRequest(res, result) {
  res.setHeader("Retry-After", String(result.retryAfterSeconds));
  sendJson(res, 429, {
    code: result.scope === "server" ? "server_budget_reached" : "rate_limited",
    error: describeLimit(result.scope)
  });
}

// A signed-in golfer carries their own daily allowance, so one person cannot
// spend the whole budget and a shared phone or network does not punish them.
// Signed-out traffic is still counted per device.
async function claimDailyAllowance(req, clientKey, limitName) {
  const limit = rateLimits[limitName];

  if (!accountsReady) {
    return claimMemoryDailyAllowance(clientKey, limitName);
  }

  let account = null;

  try {
    account = await getUserForSession(readSessionCookie(req));
  } catch (error) {
    console.error("Usage account lookup failed:", error.message);
  }

  // Device identifiers are hashed, so request counting never stores an address.
  const subject = account
    ? `user:${account.id}`
    : `device:${createHash("sha256").update(clientKey).digest("base64url").slice(0, 32)}`;

  try {
    const claim = await consumeUsage(limitName, [
      { subject, limit: limit.dailyLimit },
      { subject: "server", limit: limit.globalDailyLimit }
    ]);

    if (claim.allowed) {
      return { allowed: true };
    }

    return {
      allowed: false,
      scope: claim.deniedSubject === "server" ? "server" : account ? "account" : "day",
      retryAfterSeconds: secondsUntilUtcMidnight()
    };
  } catch (error) {
    // A database hiccup must not hand out unlimited paid calls, so fall back to
    // the in-memory counters rather than allowing the request outright.
    console.error("Durable usage accounting failed, using memory counters:", error.message);
    return claimMemoryDailyAllowance(clientKey, limitName);
  }
}

function describeLimit(scope) {
  if (scope === "server") {
    return "This server hit its daily budget for caddie requests. Scoring and saved course data still work, and the budget resets at midnight UTC.";
  }

  if (scope === "account") {
    return "Daily request limit reached for this account. Scoring and saved course data still work, and the limit resets at midnight UTC.";
  }

  if (scope === "day") {
    return "Daily request limit reached for this device. Try again tomorrow.";
  }

  return "Too many requests in a short time. Wait a moment and ask again.";
}

async function handleAccountRequest(req, res, url) {
  if (!accountsReady) {
    sendJson(res, 501, {
      code: "accounts_disabled",
      error: "This server runs in device-only mode. Your data stays in this browser."
    });
    return;
  }
  if (req.method !== "GET" && !isTrustedMutation(req, url)) {
    sendJson(res, 403, { error: "Cross-site account requests are not allowed." });
    return;
  }


  const route = url.pathname.replace("/api/account", "") || "/";

  if (route !== "/login-link" && !checkRateLimit(getClientKey(req), "auth").allowed) {
    res.setHeader("Retry-After", "60");
    sendJson(res, 429, { code: "rate_limited", error: "Too many account requests. Wait a moment and try again." });
    return;
  }

  try {
    if (req.method === "POST" && route === "/login-link") {
      await handleLoginLinkRequest(req, res, url);
      return;
    }

    const user = await getUserForSession(readSessionCookie(req));

    if (req.method === "GET" && route === "/") {
      sendJson(res, 200, user
        ? { signedIn: true, email: user.email, name: user.display_name || "" }
        : { signedIn: false });
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

    if (req.method === "POST" && route === "/name") {
      const body = await readJsonBody(req, 4 * 1024);
      const updated = await setUserDisplayName(user.id, body && body.name);

      if (!updated) {
        sendJson(res, 400, { error: "Enter the name you want the caddie to call you." });
        return;
      }

      sendJson(res, 200, { signedIn: true, email: updated.email, name: updated.display_name });
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
  // The caddie speaks to a person, and rounds record a name, so an account
  // always carries one. Returning golfers simply confirm the name they use.
  const name = String((body && body.name) || "").trim().slice(0, 60);

  if (!isValidEmail(email)) {
    sendJson(res, 400, { error: "Enter a valid email address." });
    return;
  }

  if (name.length < 2) {
    sendJson(res, 400, { error: "Enter the name you want the caddie to call you." });
    return;
  }

  if (!checkRateLimit(getClientKey(req), "auth").allowed) {
    sendJson(res, 429, { error: "Too many sign-in attempts. Wait a moment and try again." });
    return;
  }

  const baseUrl = publicBaseUrl(req, url);

  const created = await createLoginLink(email, name);

  if (!created) {
    sendJson(res, 429, {
      error: "There are already unused sign-in links for that address. Use the newest one or wait for it to expire."
    });
    return;
  }

  const { token, minutes } = created;
  const link = `${baseUrl}/signin?token=${encodeURIComponent(token)}`;
  const delivery = await sendLoginEmail(email, link, minutes);

  if (delivery === "failed") {
    // The link is a bearer credential. A configured deployment must never fall
    // back to writing it somewhere the requester cannot reach.
    sendJson(res, 502, {
      error: "The sign-in email could not be sent right now. Try again in a moment."
    });
    return;
  }

  if (delivery === "unconfigured") {
    console.log(`Sign-in link for ${email} (valid ${minutes} minutes): ${link}`);
  }

  sendJson(res, 200, {
    sent: true,
    delivery: delivery === "sent" ? "email" : "server_log",
    message: delivery === "sent"
      ? `Check ${email} for a sign-in link. It expires in ${minutes} minutes.`
      : `Email delivery is not configured on this server, so the link was written to the server log. It expires in ${minutes} minutes.`
  });
}

async function sendLoginEmail(email, link, minutes) {
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const from = String(process.env.LOGIN_EMAIL_FROM || "").trim();

  if (!apiKey || !from) {
    return "unconfigured";
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
      }),
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      console.error("Sign-in email failed:", response.status, (await response.text()).slice(0, 200));
      return "failed";
    }

    return "sent";
  } catch (error) {
    console.error("Sign-in email error:", error.message);
    return "failed";
  }
}

// A cookie-setting GET can be triggered by any third-party page (an <img> tag
// is enough), which would plant an attacker's session in the victim's browser
// and silently sync their data into the attacker's account. Redemption
// therefore requires a same-site POST the wearer actually clicks.
async function handleSignInRedemption(req, res, url) {
  if (!accountsReady) {
    sendText(res, 404, "Not found", "text/plain");
    return;
  }

  if (req.method === "GET") {
    const token = url.searchParams.get("token") || "";

    sendText(res, 200, renderSignInConfirmPage(token), "text/html");
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  const site = String(req.headers["sec-fetch-site"] || "").toLowerCase();

  if (site && site !== "same-origin" && site !== "same-site" && site !== "none") {
    sendText(res, 403, "Cross-site sign-in is not allowed.", "text/plain");
    return;
  }

  if (!checkRateLimit(getClientKey(req), "auth").allowed) {
    sendText(res, 429, "Too many sign-in attempts. Wait a moment and try again.", "text/plain");
    return;
  }

  let body;

  try {
    body = await readFormBody(req, 4 * 1024);
  } catch {
    body = new URLSearchParams();
  }

  const token = body.get("token") || "";

  try {
    const result = await redeemLoginLink(token);

    if (!result) {
      res.writeHead(303, { ...securityHeaders(), Location: "/index.html?signin=expired" });
      res.end();
      return;
    }

    res.writeHead(303, {
      ...securityHeaders(),
      "Set-Cookie": buildSessionCookie(result.sessionToken, 90 * 24 * 60 * 60),
      Location: "/index.html?signin=ok"
    });
    res.end();
  } catch (error) {
    console.error("Sign-in redemption failed:", error.message);
    res.writeHead(303, { ...securityHeaders(), Location: "/index.html?signin=error" });
    res.end();
  }
}

function renderSignInConfirmPage(token) {
  const safeToken = String(token).replace(/[^A-Za-z0-9_-]/g, "");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>Finish signing in — Golf Assistant</title>
<link rel="stylesheet" href="/style.css" />
</head>
<body>
<div class="app-shell">
  <main class="app-main legal-page">
    <div class="page-head"><div><h2>Finish signing in</h2><p>Confirm to sign in to Golf Assistant on this device.</p></div></div>
    <form class="card legal-body" method="POST" action="/signin">
      <input type="hidden" name="token" value="${safeToken}" />
      <p>Only continue if you asked for this sign-in link.</p>
      <button class="btn btn-primary btn-block btn-lg" type="submit">Sign in on this device</button>
    </form>
    <div class="card legal-body"><p><a href="/index.html">Cancel and go back</a></p></div>
  </main>
</div>
</body>
</html>`;
}

function publicBaseUrl(req, url) {
  const configured = String(process.env.PUBLIC_BASE_URL || "").trim();

  if (configured) {
    const parsed = new URL(configured);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("PUBLIC_BASE_URL must use http or https.");
    }

    return parsed.origin;
  }

  if (url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
    throw new Error("PUBLIC_BASE_URL is required for non-local sign-in links.");
  }

  return url.origin;
}

function buildSessionCookie(value, maxAgeSeconds) {
  return buildCookie("golf_session", value, maxAgeSeconds);
}

function readCookie(req, name) {
  const header = String(req.headers.cookie || "");
  const prefix = `${name}=`;
  const match = header.split(";").map(part => part.trim()).find(part => part.startsWith(prefix));

  if (!match) {
    return "";
  }

  try {
    return decodeURIComponent(match.slice(prefix.length));
  } catch {
    return "";
  }
}

function readSessionCookie(req) {
  return readCookie(req, "golf_session");
}

function buildCookie(name, value, maxAgeSeconds) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
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

function isTrustedMutation(req, url) {
  const site = String(req.headers["sec-fetch-site"] || "").toLowerCase();

  if (site && site !== "same-origin" && site !== "same-site" && site !== "none") {
    return false;
  }

  const origin = String(req.headers.origin || "").trim();

  if (!origin) {
    return true;
  }

  try {
    return new URL(origin).origin === new URL(publicBaseUrl(req, url)).origin;
  } catch {
    return false;
  }
}

function readFormBody(req, maxBytes) {
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
      resolve(new URLSearchParams(Buffer.concat(chunks).toString("utf8")));
    });

    req.on("error", reject);
  });
}

// The shared access code used to live in localStorage, where any injected
// script could read it. The browser now exchanges it for an HttpOnly cookie
// and never holds the secret itself.
async function handleAccessCodeRequest(req, res) {
  const site = String(req.headers["sec-fetch-site"] || "").toLowerCase();

  if (site && site !== "same-origin" && site !== "same-site" && site !== "none") {
    sendJson(res, 403, { error: "Cross-site access changes are not allowed." });
    return;
  }

  if (!checkRateLimit(getClientKey(req), "auth").allowed) {
    sendJson(res, 429, { error: "Too many attempts. Wait a moment and try again." });
    return;
  }

  let body;

  try {
    body = await readJsonBody(req, 4 * 1024);
  } catch (error) {
    sendJson(res, 400, { error: error.message });
    return;
  }

  if (body && body.clear === true) {
    res.setHeader("Set-Cookie", buildCookie("golf_access", "", 0));
    sendJson(res, 200, { accepted: false, required: accessToken !== "" });
    return;
  }

  if (!accessToken) {
    sendJson(res, 200, { accepted: true, required: false });
    return;
  }

  if (!secretsMatch(String((body && body.code) || "").trim(), accessToken)) {
    sendJson(res, 401, { code: "access_code_required", error: "That access code is not correct." });
    return;
  }

  res.setHeader("Set-Cookie", buildCookie("golf_access", accessCookieValue, 180 * 24 * 60 * 60));
  sendJson(res, 200, { accepted: true, required: true });
}

async function handleAdminRequest(req, res) {
  if (!adminToken) {
    sendJson(res, 404, { error: "Admin controls are not enabled on this server." });
    return;
  }

  const provided = String(req.headers["x-admin-token"] || "").trim();

  if (!secretsMatch(provided, adminToken)) {
    console.warn(`Admin auth failure from ${getClientKey(req)}.`);
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

  let durable = null;

  if (accountsReady) {
    try {
      durable = await readUsageSummary();
    } catch (error) {
      console.error("Could not read durable usage:", error.message);
    }
  }

  sendJson(res, 200, {
    paused: apiPaused,
    pausedReason: pausedReason,
    utcDay: dailyCounterDay,
    secondsUntilReset: secondsUntilUtcMidnight(),
    counterStore: durable ? "database" : "memory",
    usage: {
      ai: {
        today: durable ? (durable.ai ? durable.ai.serverUsed : 0) : globalDailyCounters.ai,
        dailyCeiling: rateLimits.ai.globalDailyLimit,
        accounts: durable && durable.ai ? durable.ai.accounts : null,
        devices: durable && durable.ai ? durable.ai.devices : null
      },
      golfapi: {
        today: durable ? (durable.golfapi ? durable.golfapi.serverUsed : 0) : globalDailyCounters.golfapi,
        dailyCeiling: rateLimits.golfapi.globalDailyLimit,
        accounts: durable && durable.golfapi ? durable.golfapi.accounts : null,
        devices: durable && durable.golfapi ? durable.golfapi.devices : null
      }
    },
    perClientLimits: {
      ai: { perWindow: rateLimits.ai.windowLimit, perDay: rateLimits.ai.dailyLimit },
      golfapi: { perWindow: rateLimits.golfapi.windowLimit, perDay: rateLimits.golfapi.dailyLimit }
    },
    note: durable
      ? "Daily counters are stored per account and per device in the database and reset at midnight UTC. Short-window burst limits stay in memory."
      : "No database is configured, so counters live in server memory and reset on restart or at midnight UTC."
  });
}

function hasValidAccessToken(req) {
  if (!accessToken) {
    return true;
  }

  const header = String(req.headers["x-app-token"] || "").trim();
  const cookie = readCookie(req, "golf_access");

  return secretsMatch(header, accessToken) || secretsMatch(cookie, accessCookieValue);
}

// Comparing raw strings leaks length and throws a RangeError on multi-byte
// input of equal character count. Digests are always the same byte length.
function secretsMatch(provided, expected) {
  if (!provided || !expected) {
    return false;
  }

  const providedDigest = createHash("sha256").update(String(provided)).digest();
  const expectedDigest = createHash("sha256").update(String(expected)).digest();

  return timingSafeEqual(providedDigest, expectedDigest);
}

// Trust forwarded addresses only when the deployment explicitly declares how
// many reverse-proxy hops it controls. Direct deployments default to the socket.
function getClientKey(req) {
  const hops = Math.max(0, Math.floor(Number(process.env.TRUSTED_PROXY_HOPS) || 0));
  const chain = String(req.headers["x-forwarded-for"] || "")
    .split(",")
    .map(part => part.trim())
    .filter(Boolean);

  if (hops > 0 && chain.length > 0) {
    const index = Math.max(0, chain.length - hops);

    return chain[index] || req.socket.remoteAddress || "unknown";
  }

  return req.socket.remoteAddress || "unknown";
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

// Burst protection stays in memory on purpose: it guards a five-minute window,
// so losing it on restart costs nothing, and it must answer without a round
// trip to the database on every request.
function checkWindowLimit(clientKey, limitName) {
  const limit = rateLimits[limitName];
  const now = Date.now();
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
  pruneRateLimitBuckets(now);

  return { allowed: true };
}

// Used when no database is configured, and as the fallback if one stops
// answering. Counts reset on restart, which is why it is not the main path.
function claimMemoryDailyAllowance(clientKey, limitName) {
  const limit = rateLimits[limitName];

  rollDailyCountersIfNeeded();

  if (globalDailyCounters[limitName] >= limit.globalDailyLimit) {
    return { allowed: false, scope: "server", retryAfterSeconds: secondsUntilUtcMidnight() };
  }

  const dailyKey = `${limitName}:${clientKey}`;
  const dailyCount = dailyCounters.get(dailyKey) || 0;

  if (dailyCount >= limit.dailyLimit) {
    return { allowed: false, scope: "day", retryAfterSeconds: secondsUntilUtcMidnight() };
  }

  dailyCounters.set(dailyKey, dailyCount + 1);
  globalDailyCounters[limitName] += 1;

  return { allowed: true };
}

function rollDailyCountersIfNeeded() {
  const today = currentUtcDay();

  if (today !== dailyCounterDay) {
    dailyCounterDay = today;
    dailyCounters.clear();
    globalDailyCounters.ai = 0;
    globalDailyCounters.golfapi = 0;
    globalDailyCounters.auth = 0;
    globalDailyCounters.conditions = 0;

    if (accountsReady) {
      pruneUsageCounters().catch(error => {
        console.error("Could not prune old usage counters:", error.message);
      });
    }
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

// Wind, temperature, and ground elevation from Open-Meteo, which needs no key.
// The browser never calls it directly, so a golfer's coordinates are not handed
// to another provider by the phone, and nearby requests share one cached answer.
async function handleConditionsRequest(url, res) {
  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));
  const targetLat = Number(url.searchParams.get("targetLat"));
  const targetLng = Number(url.searchParams.get("targetLng"));

  if (!isValidLatitude(lat) || !isValidLongitude(lng)) {
    sendJson(res, 400, { error: "A valid latitude and longitude are required." });
    return;
  }

  const hasTarget = isValidLatitude(targetLat) && isValidLongitude(targetLng);
  // Three decimals is about 100 m: fine enough for weather, coarse enough that
  // one cached answer serves a whole hole and blurs the stored position.
  const cacheKey = [lat.toFixed(3), lng.toFixed(3), hasTarget ? targetLat.toFixed(3) : "", hasTarget ? targetLng.toFixed(3) : ""].join(",");
  const cached = readGolfApiCache(`conditions:${cacheKey}`);

  if (cached) {
    sendText(res, 200, cached.body, "application/json");
    return;
  }

  const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
  weatherUrl.searchParams.set("latitude", lat.toFixed(4));
  weatherUrl.searchParams.set("longitude", lng.toFixed(4));
  weatherUrl.searchParams.set("current", "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m");
  weatherUrl.searchParams.set("temperature_unit", "fahrenheit");
  weatherUrl.searchParams.set("wind_speed_unit", "mph");

  const elevationUrl = new URL("https://api.open-meteo.com/v1/elevation");
  elevationUrl.searchParams.set("latitude", hasTarget ? `${lat.toFixed(5)},${targetLat.toFixed(5)}` : lat.toFixed(5));
  elevationUrl.searchParams.set("longitude", hasTarget ? `${lng.toFixed(5)},${targetLng.toFixed(5)}` : lng.toFixed(5));

  try {
    const [weatherResponse, elevationResponse] = await Promise.all([
      fetch(weatherUrl, { signal: AbortSignal.timeout(8000) }),
      fetch(elevationUrl, { signal: AbortSignal.timeout(8000) })
    ]);

    if (!weatherResponse.ok) {
      sendJson(res, 502, { error: "The weather service could not answer that request." });
      return;
    }

    const weather = JSON.parse(await readLimitedResponseText(weatherResponse, 256 * 1024) || "{}");
    const current = weather.current || {};
    let elevations = [];

    if (elevationResponse.ok) {
      const elevationBody = JSON.parse(await readLimitedResponseText(elevationResponse, 32 * 1024) || "{}");
      elevations = Array.isArray(elevationBody.elevation) ? elevationBody.elevation : [];
    }

    const playerElevation = Number.isFinite(elevations[0]) ? elevations[0] : null;
    const targetElevation = hasTarget && Number.isFinite(elevations[1]) ? elevations[1] : null;
    const body = JSON.stringify({
      observedAt: current.time || new Date().toISOString(),
      temperatureF: Number.isFinite(current.temperature_2m) ? Math.round(current.temperature_2m) : null,
      humidityPercent: Number.isFinite(current.relative_humidity_2m) ? Math.round(current.relative_humidity_2m) : null,
      windMph: Number.isFinite(current.wind_speed_10m) ? Math.round(current.wind_speed_10m) : null,
      windGustMph: Number.isFinite(current.wind_gusts_10m) ? Math.round(current.wind_gusts_10m) : null,
      // Meteorological convention: the direction the wind blows *from*.
      windFromDegrees: Number.isFinite(current.wind_direction_10m) ? Math.round(current.wind_direction_10m) : null,
      elevation: {
        playerMeters: playerElevation,
        targetMeters: targetElevation,
        riseMeters: playerElevation !== null && targetElevation !== null
          ? Math.round((targetElevation - playerElevation) * 10) / 10
          : null
      },
      source: "Open-Meteo"
    });

    writeGolfApiCache(`conditions:${cacheKey}`, "conditions", body, "application/json");
    sendText(res, 200, body, "application/json");
  } catch (error) {
    console.error("Conditions lookup failed:", error.message);
    sendJson(res, 502, { error: "Could not reach the weather service." });
  }
}

function isValidLatitude(value) {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

function isValidLongitude(value) {
  return Number.isFinite(value) && value >= -180 && value <= 180;
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

  // Only forward parameters the app actually uses. Arbitrary parameters let a
  // caller bust the cache and spend provider quota at will.
  url.searchParams.forEach((value, key) => {
    if (value !== "" && allowedGolfApiParams.has(key) && value.length <= 80) {
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
      },
      signal: AbortSignal.timeout(15000)
    });

    const bodyText = await readLimitedResponseText(response, GOLFAPI_RESPONSE_MAX_BYTES);

    if (!response.ok) {
      console.error(`GOLFAPI ${resource} responded ${response.status}.`);
      sendJson(res, 502, { error: "The course data provider could not answer that request." });
      return;
    }

    let body;

    try {
      body = JSON.stringify(JSON.parse(bodyText || "{}"));
    } catch {
      sendJson(res, 502, { error: "The course data provider returned invalid data." });
      return;
    }

    writeGolfApiCache(cacheKey, resource, body, "application/json");
    sendText(res, 200, body, "application/json");
  } catch (error) {
    console.error("GOLFAPI proxy error:", error.message);
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
  if (Buffer.byteLength(body, "utf8") > GOLFAPI_CACHE_MAX_BYTES) {
    return;
  }

  if (golfApiCache.size >= GOLFAPI_CACHE_MAX_ENTRIES) {
    golfApiCache.delete(golfApiCache.keys().next().value);
  }

  // Weather moves; course data does not.
  const ttlMs = resource === "conditions"
    ? 10 * 60 * 1000
    : resource === "clubs" ? 30 * 60 * 1000 : 12 * 60 * 60 * 1000;

  golfApiCache.set(key, {
    body: body,
    contentType: contentType,
    expiresAt: Date.now() + ttlMs
  });
}

async function readLimitedResponseText(response, maxBytes) {
  if (!response.body) {
    return "";
  }

  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    size += value.byteLength;

    if (size > maxBytes) {
      await reader.cancel();
      throw new Error("Upstream response was too large.");
    }

    chunks.push(Buffer.from(value));
  }

  return Buffer.concat(chunks, size).toString("utf8");
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
    you: round.you ? String(round.you).slice(0, 60) : null,
    golferName: round.golferName ? String(round.golferName).slice(0, 60) : "",
    totalHoles: Number(round.totalHoles || 18),
    currentHole: Number(round.currentHole || 1),
    scores: round.scores || {},
    holePars: round.holePars || {},
    holeLengths: round.holeLengths || {},
    currentHoleContext: round.currentHoleContext || {},
    playerClubProfile: round.playerClubProfile || {},
    conditions: round.conditions || null,
    currentLie: round.currentLie ? String(round.currentLie).slice(0, 20) : null
  };
}

function buildAgentInstructions() {
  return [
    "You are a golf round voice agent and practical on-course caddie for a manual scorecard app.",
    "Interpret the user's natural language using only the supplied round JSON.",
    "Return exactly one JSON object that matches the schema. Do not include markdown.",
    "Prefer direct, concise messages suitable for both screen display and text-to-speech.",
    "round.you is the person speaking: the signed-in golfer's name in round.players. When the user says I, me, my, or myself, that means round.you.",
    "If round.you is null the account holder is not playing this round, so ask which player they mean instead of guessing.",
    "Address the golfer by round.golferName when a greeting or direct reply is natural, but never pad messages with it.",
    "Use start_round when the user wants to begin a round and clearly gives a course name plus at least one player. If players are not clear, use clarify.",
    "Use end_round when the user wants to finish, end, close, or complete the active round. This saves and summarizes; it does not delete the round.",
    "For score language, par means the hole par, birdie means par minus 1, bogey means par plus 1, double bogey means par plus 2, eagle means par minus 2.",
    "Only choose a mutating action when the player, hole, and value are clear.",
    "Use clarify for ambiguous player names, unclear holes, or unclear score values.",
    "Use recommend_club when the user asks what club to hit, what shot to play, how to attack a hole, lay up or go for it, or asks for caddie advice.",
    "For recommend_club, include any explicit distance in payload.distanceYards. If no distance is stated, leave it 0 and the browser will use GPS/course data when possible.",
    "For recommend_club, give advice like a real caddie: club, target, miss preference, and one clear swing/shot thought.",
    "round.conditions holds measured wind, temperature, and the elevation rise from the golfer to the green; round.currentLie is the lie they selected. Use them when present and say what you used. When round.conditions is null, say the call does not account for wind or elevation yet. Pin position is never known.",
    "When round.playerClubProfile.status is configured, choose payload.recommendedClub from that club list using its carryYards, preferring the shortest club that still covers the distance. Say when a club distance came from the golfer's logged shots. When the profile is not configured, say the call is a general estimate.",
    "Do not answer club recommendation requests with the player's score, total score, or only the raw distance.",
    "Use log_shot when the golfer reports a shot they just hit, such as 'log a 7 iron 165 straight', 'I hit pitching wedge 120, pin high', or 'that was a 9 iron, came up short'. Fill payload.club and payload.distanceYards, and set payload.shotResult, payload.shotLie, and payload.shotDirection when they are stated; leave them empty when they are not.",
    "Never use log_shot for a score. 'I made a five' is save_scores; 'I hit five iron 180' is log_shot.",
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

function securityHeaders() {
  return {
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self'",
      "img-src 'self' data:",
      "connect-src 'self'",
      "font-src 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'none'",
      "form-action 'self'"
    ].join("; "),
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Permissions-Policy": "geolocation=(self), microphone=(self), camera=(), payment=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
  };
}

function sendText(res, status, text, contentType) {
  res.writeHead(status, {
    ...securityHeaders(),
    "Content-Type": contentType,
    "Cache-Control": "no-store"
  });
  res.end(text);
}

function sendBuffer(res, status, body, contentType) {
  res.writeHead(status, {
    ...securityHeaders(),
    "Content-Type": contentType,
    "Cache-Control": "no-cache"
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
        "log_shot",
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
        missPreference: { type: "string" },
        club: { type: "string" },
        shotResult: { type: "string", enum: ["", "as planned", "short", "long"] },
        shotLie: { type: "string", enum: ["", "tee", "fairway", "rough", "sand", "recovery"] },
        shotDirection: { type: "string", enum: ["", "straight", "left", "right"] }
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
        "missPreference",
        "club",
        "shotResult",
        "shotLie",
        "shotDirection"
      ]
    },
    message: { type: "string" },
    speak: { type: "boolean" }
  },
  required: ["action", "confidence", "payload", "message", "speak"]
};
