export const config = {
  maxDuration: 30,
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const { prompt } = req.body;

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
    catch { return res.status(500).json({ error: `Non-JSON: ${raw.slice(0, 80)}` }); }

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message ?? `API error ${response.status}` });
    }

    const text = data.content?.map(c => c.type === "text" ? c.text : "").join("") ?? "";
    return res.status(200).json({ text, provider: "anthropic/claude-sonnet-4-6" });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
