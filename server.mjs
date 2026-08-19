import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadDotEnv();

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";
const model = process.env.OPENAI_MODEL || "gpt-5-mini";
const golfApiBaseUrl = process.env.GOLFAPI_BASE_URL || "https://golfapi.io/api/v2.3";
const allowedGolfApiResources = new Set(["clubs", "courses", "coordinates"]);

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
        golfApiConfigured: Boolean(process.env.GOLFAPI_API_KEY)
      });
      return;
    }

    if (req.method === "GET" && url.pathname.startsWith("/api/golfapi/")) {
      await handleGolfApiRequest(url, res);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/voice-agent") {
      await handleVoiceAgentRequest(req, res);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/transcribe") {
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
});

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

    sendText(res, 200, bodyText || "{}", response.headers.get("content-type") || "application/json");
  } catch (error) {
    console.error("GOLFAPI proxy error:", error);
    sendJson(res, 502, { error: "Could not reach GOLFAPI." });
  }
}

async function serveStaticFile(pathname, res) {
  const relativePath = pathname === "/" ? "index.html" : decodeURIComponent(pathname.slice(1));
  const requestedPath = path.normalize(path.join(__dirname, relativePath));

  if (!requestedPath.startsWith(__dirname)) {
    sendText(res, 403, "Forbidden", "text/plain");
    return;
  }

  try {
    const body = await readFile(requestedPath);
    sendBuffer(res, 200, body, mimeTypes[path.extname(requestedPath)] || "application/octet-stream");
  } catch {
    sendText(res, 404, "Not found", "text/plain");
  }
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
    holeTargets: round.holeTargets || {},
    holeHazards: round.holeHazards || {},
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
    "For recommend_club, give advice like a real caddie: club, target, miss preference, and one clear swing/shot thought. Mention uncertainty when personal club distances, wind, lie, elevation, or pin location are unknown.",
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
