export const config = {
  maxDuration: 35,
};

const HEADERS = { "Content-Type": "application/json" };

async function callOpenRouter(prompt) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("No OpenRouter key");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
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

    // Safely parse response — may not be JSON on error
    const raw = await response.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error(`OpenRouter non-JSON response: ${raw.slice(0, 100)}`);
    }

    if (!response.ok) {
      throw new Error(data.error?.message ?? data.message ?? `OpenRouter ${response.status}`);
    }

    const text = data.choices?.[0]?.message?.content ?? "";
    if (!text) throw new Error("Empty response from OpenRouter");
    return text;
  } finally {
    clearTimeout(timeout);
  }
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

  const raw = await response.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`Anthropic non-JSON response: ${raw.slice(0, 100)}`);
  }

  if (!response.ok) {
    throw new Error(data.error?.message ?? `Anthropic ${response.status}`);
  }

  return data.content?.map(c => c.type === "text" ? c.text : "").join("") ?? "";
}

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { prompt } = await req.json();

    let text, provider;
    try {
      text = await callOpenRouter(prompt);
      provider = "openrouter/qwen3.7-plus";
    } catch (e) {
      console.error(`OpenRouter failed: ${e.message} — falling back to Claude`);
      text = await callClaude(prompt);
      provider = "anthropic/claude-sonnet-4-6";
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
