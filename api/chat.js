export const config = {
  maxDuration: 30,
};

const HEADERS = { "Content-Type": "application/json" };

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500, headers: HEADERS,
    });
  }

  try {
    const { prompt } = await req.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const raw = await response.text();
    let data;
    try { data = JSON.parse(raw); }
    catch { throw new Error(`Non-JSON response: ${raw.slice(0, 80)}`); }

    if (!response.ok) throw new Error(data.error?.message ?? `API error ${response.status}`);

    const text = data.content?.map(c => c.type === "text" ? c.text : "").join("") ?? "";

    return new Response(JSON.stringify({ text, provider: "anthropic/claude-sonnet-4-6" }), {
      status: 200, headers: HEADERS,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: HEADERS,
    });
  }
}
