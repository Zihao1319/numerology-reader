export const config = {
  runtime: "edge",
};

const HEADERS = { "Content-Type": "application/json" };

async function callOpenRouter(prompt) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("No OpenRouter key");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "qwen/qwen3.7-plus",
      max_tokens: 1000,
      messages: [
        { role: "system", content: "You are a helpful numerology reader. Be concise and direct." },
        { role: "user", content: prompt },
      ],
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message ?? `OpenRouter error ${response.status}`);
  const text = data.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("Empty response from OpenRouter");
  return text;
}

async function callClaude(prompt) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("No Anthropic key");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message ?? `Anthropic error ${response.status}`);
  const text = data.content?.map(c => c.type === "text" ? c.text : "").join("") ?? "";
  if (!text) throw new Error("Empty response from Anthropic");
  return text;
}

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { prompt } = await req.json();

    // Try OpenRouter (Qwen) first, fall back to Claude
    let text;
    let provider = "openrouter";
    try {
      text = await callOpenRouter(prompt);
    } catch (e) {
      console.error(`OpenRouter failed: ${e.message}, falling back to Claude`);
      provider = "anthropic";
      text = await callClaude(prompt);
    }

    return new Response(JSON.stringify({ text, provider }), {
      status: 200,
      headers: HEADERS,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: HEADERS,
    });
  }
}
