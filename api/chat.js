import { defaultChain, runChain } from "./_llm.js";

export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prompt, chain: chainOverride } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "prompt required" });

  const chain = Array.isArray(chainOverride) && chainOverride.length
    ? chainOverride
    : defaultChain(process.env);

  try {
    const { text, provider } = await runChain({
      prompt,
      chain,
      env: process.env,
      fetchImpl: fetch,
    });
    return res.status(200).json({ text, provider });
  } catch (err) {
    return res.status(err.status || 500).json({
      error: err.message,
      ...(err.failures ? { failures: err.failures } : {}),
    });
  }
}
