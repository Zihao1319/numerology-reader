// Local dev API server — replaces Vercel serverless functions
// Run: node dev-server.js
// Then in another terminal: npm run dev

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import express from "express";
import handler from "./api/chat.js";

const app = express();
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const origJson = res.json.bind(res);
  res.json = (body) => {
    if (body?.failures) console.error("LLM failures:", body.failures);
    if (body?.error) console.error("LLM error:", body.error);
    return origJson(body);
  };
  await handler(req, res);
});

app.listen(3001, () => {
  console.log("API server on http://localhost:3001");
  console.log("ANTHROPIC_API_KEY:", process.env.ANTHROPIC_API_KEY ? "set" : "MISSING");
  console.log("OPENROUTER_API_KEY:", process.env.OPENROUTER_API_KEY ? "set" : "not set");
});
