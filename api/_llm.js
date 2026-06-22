// Pure chain runner — dependency-injected for testability.
// T0 NOTE (deploy blocker): Before first deploy with OpenRouter, fire a live probe to confirm
// OPENROUTER_MODEL returns non-empty choices[0].message.content.
// Default qwen/qwen-2.5-72b-instruct is a known-stable Chinese-capable model on OpenRouter.

export const MAX_TOKENS = 1400;
export const PER_CALL_TIMEOUT_MS = 22000; // < maxDuration 30s, leaves room for one fallback

export function defaultChain(env) {
  if (env.LLM_CHAIN) {
    try { return JSON.parse(env.LLM_CHAIN); } catch { /* fall through to default */ }
  }
  return [
    { provider: "openrouter", model: env.OPENROUTER_MODEL || "qwen/qwen-2.5-72b-instruct" },
    { provider: "anthropic",  model: env.ANTHROPIC_MODEL  || "claude-sonnet-4-6" },
  ];
}

async function withTimeout(promiseFactory, timeoutMs) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try { return await promiseFactory(ctrl.signal); }
  finally { clearTimeout(t); }
}

async function callOpenRouter({ prompt, model, signal, env, fetchImpl, maxTokens }) {
  const key = env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY missing");
  const r = await fetchImpl("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST", signal,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`,
      "HTTP-Referer": "https://numerology-reader.vercel.app",
      "X-Title": "Numerology Reader",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const raw = await r.text();
  let data;
  try { data = JSON.parse(raw); }
  catch { throw new Error(`OpenRouter non-JSON: ${raw.slice(0, 80)}`); }
  if (!r.ok) throw new Error(data.error?.message || `OpenRouter ${r.status}`);
  const text = data.choices?.[0]?.message?.content ?? "";
  if (!text.trim()) throw new Error("OpenRouter empty text");
  return { text };
}

async function callAnthropic({ prompt, model, signal, env, fetchImpl, maxTokens }) {
  const key = env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY missing");
  const r = await fetchImpl("https://api.anthropic.com/v1/messages", {
    method: "POST", signal,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const raw = await r.text();
  let data;
  try { data = JSON.parse(raw); }
  catch { throw new Error(`Anthropic non-JSON: ${raw.slice(0, 80)}`); }
  if (!r.ok) throw new Error(data.error?.message || `Anthropic ${r.status}`);
  const text = data.content?.map(c => c.type === "text" ? c.text : "").join("") ?? "";
  if (!text.trim()) throw new Error("Anthropic empty text");
  return { text };
}

const ADAPTERS = { openrouter: callOpenRouter, anthropic: callAnthropic };

// Returns {text, provider} on success, throws with .status and .failures on failure.
export async function runChain({
  prompt,
  chain,
  env,
  fetchImpl,
  timeoutMs = PER_CALL_TIMEOUT_MS,
  maxTokens = MAX_TOKENS,
}) {
  const failures = [];
  for (const { provider, model } of chain) {
    const adapter = ADAPTERS[provider];
    if (!adapter) { failures.push(`${provider}: unknown provider`); continue; }
    try {
      const { text } = await withTimeout(
        sig => adapter({ prompt, model, signal: sig, env, fetchImpl, maxTokens }),
        timeoutMs,
      );
      return { text, provider: `${provider}/${model}` };
    } catch (e) {
      failures.push(`${provider}/${model}: ${e.message}`);
    }
  }
  const allKeyless = failures.every(f => /missing|unknown provider/.test(f));
  const err = new Error(allKeyless ? "no LLM provider configured" : "all providers failed");
  err.status = allKeyless ? 500 : 502;
  err.failures = failures;
  throw err;
}
