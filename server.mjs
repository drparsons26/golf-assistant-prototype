import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadDotEnv();

const port = Number(process.env.PORT || 3000);
const model = process.env.OPENAI_MODEL || "gpt-5-mini";

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
        openaiConfigured: Boolean(process.env.OPENAI_API_KEY)
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/voice-agent") {
      await handleVoiceAgentRequest(req, res);
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
}).listen(port, "127.0.0.1", () => {
  console.log(`Golf Assistant running at http://127.0.0.1:${port}/`);
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
    holePars: round.holePars || {}
  };
}

function buildAgentInstructions() {
  return [
    "You are a golf round voice agent for a manual scorecard app.",
    "Interpret the user's natural language using only the supplied round JSON.",
    "Return exactly one JSON object that matches the schema. Do not include markdown.",
    "Prefer direct, concise messages suitable for both screen display and text-to-speech.",
    "When the user says I, me, my, or myself, treat that as the first player in round.players.",
    "For score language, par means the hole par, birdie means par minus 1, bogey means par plus 1, double bogey means par plus 2, eagle means par minus 2.",
    "Only choose a mutating action when the player, hole, and value are clear.",
    "Use clarify for ambiguous player names, unclear holes, or unclear score values.",
    "Use get_green_yardage or get_hazard_distance for distance questions; the browser will handle GPS.",
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
        "save_scores",
        "change_score",
        "set_par",
        "go_to_hole",
        "answer_question",
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
        questionType: { type: "string" },
        targetName: { type: "string" },
        answer: { type: "string" }
      },
      required: [
        "scores",
        "player",
        "score",
        "hole",
        "par",
        "questionType",
        "targetName",
        "answer"
      ]
    },
    message: { type: "string" },
    speak: { type: "boolean" }
  },
  required: ["action", "confidence", "payload", "message", "speak"]
};
