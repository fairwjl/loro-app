// server/index.js
import express from "express";
import cors from "cors";
import "dotenv/config";
import OpenAI from "openai";

const app = express();

// --- Config ---
const PORT = process.env.PORT || 8787;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// --- Middleware ---
app.use(cors());                 // allow all origins during testing
app.options('*', cors());        // ensure preflight (OPTIONS) gets CORS headers
app.use(express.json());

// --- Health check ---
app.get("/health", (_req, res) => {
  res.json({ ok: true, model: OPENAI_MODEL });
});

// --- Reflection route ---
app.post("/reflect", async (req, res) => {
  try {
    const { entry } = req.body || {};
    if (!entry || typeof entry !== "string") {
      return res.status(400).json({ error: "Missing 'entry' string" });
    }

    // Guard for missing API key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Server missing OPENAI_API_KEY" });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const sysPrompt =
      "You are a supportive, evidence-informed reflection helper. " +
      "Summarize the user's journal entry in 2–3 sentences, note feelings, " +
      "and suggest one gentle, concrete next step. Avoid clinical diagnoses.";

    const resp = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: sysPrompt },
        { role: "user", content: entry },
      ],
      temperature: 0.4,
    });

    const reflection =
      resp.choices?.[0]?.message?.content?.trim() ||
      "I read your entry. I’m here with you.";

    res.json({ reflection });
  } catch (err) {
    console.error("Reflect error:", err);
    res.status(500).json({ error: "Reflection failed" });
  }
});
// --- Debug: Verify API key is wired ---
app.get("/whoami", async (_req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const models = await openai.models.list(); // lightweight call

    res.json({
      ok: true,
      usingKey: process.env.OPENAI_API_KEY.slice(0, 8) + "...",
      modelCount: models.data?.length || 0,
    });
  } catch (err) {
    console.error("whoami error:", err.message);
    res.status(500).json({ error: "API key test failed" });
  }
});
// --- Start ---
// Lock the server to a single, known port (default 8787). If it's in use, fail fast
// with a clear message instead of silently switching ports (prevents client/server drift).
const server = app.listen(PORT, () => {
  console.log(`Loro server running on http://localhost:${PORT}`);
});

server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    console.error(
      `\nPort ${PORT} is already in use.\n` +
      `Close the process using it and try again.\n\n` +
      `macOS example:\n` +
      `  lsof -ti:${PORT} -sTCP:LISTEN | xargs kill -9\n`
    );
    process.exit(1);
  } else {
    console.error("Server failed to start:", err);
    process.exit(1);
  }
});