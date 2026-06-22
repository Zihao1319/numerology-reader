# Design — Configurable LLM Provider

> Implements specs/llm-provider-config/requirements.md
> Touches: `api/chat.js` (rewrite), `src/App.jsx` (rename only), `README.md` (env docs).

## 1. Provider chain configuration (AC-1.1)

Chain is defined server-side in `api/chat.js`, seeded from env so it can change without code:

```js
// api/chat.js
function defaultChain() {
  // LLM_CHAIN env (optional) = JSON array, overrides the built-in default.
  // e.g. '[{"provider":"openrouter","model":"qwen/qwen-2.5-72b-instruct"},
  //        {"provider":"anthropic","model":"claude-sonnet-4-6"}]'
  if (process.env.LLM_CHAIN) {
    try { return JSON.parse(process.env.LLM_CHAIN); } catch { /* fall through */ }
  }
  return [
    { provider: "openrouter", model: process.env.OPENROUTER_MODEL || "qwen/qwen-2.5-72b-instruct" },
    { provider: "anthropic",  model: process.env.ANTHROPIC_MODEL  || "claude-sonnet-4-6" },
  ];
}
```

Env vars:
| Var | Purpose | Required |
|---|---|---|
| `OPENROUTER_API_KEY` | OpenRouter auth | for openrouter entries |
| `ANTHROPIC_API_KEY` | Anthropic auth | for anthropic entries |
| `OPENROUTER_MODEL` | override default Qwen id | no |
| `ANTHROPIC_MODEL` | override default Claude id | no |
| `LLM_CHAIN` | full JSON chain override | no |

## 2. Per-provider adapters

Each adapter takes `(prompt, model)` and returns `{ text }` or throws. Both honour a per-call
timeout via `AbortController` (AC-1.3, NFR).

```js
const PER_CALL_TIMEOUT_MS = 22000; // < maxDuration 30s, leaves room for one fallback

async function withTimeout(promiseFactory) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), PER_CALL_TIMEOUT_MS);
  try { return await promiseFactory(ctrl.signal); }
  finally { clearTimeout(t); }
}

async function callOpenRouter(prompt, model, signal) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY missing");      // AC-4.2 → skip
  const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST", signal,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`,
      "HTTP-Referer": "https://numerology-reader.vercel.app", // OpenRouter attribution
      "X-Title": "Numerology Reader",
    },
    body: JSON.stringify({ model, max_tokens: 800,
      messages: [{ role: "user", content: prompt }] }),
  });
  const raw = await r.text();
  let data; try { data = JSON.parse(raw); }
  catch { throw new Error(`OpenRouter non-JSON: ${raw.slice(0,80)}`); }
  if (!r.ok) throw new Error(data.error?.message || `OpenRouter ${r.status}`);
  const text = data.choices?.[0]?.message?.content ?? "";
  if (!text.trim()) throw new Error("OpenRouter empty text");    // AC-1.3
  return { text };
}

async function callAnthropic(prompt, model, signal) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY missing");
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", signal,
    headers: { "Content-Type": "application/json", "x-api-key": key,
               "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model, max_tokens: 800,
      messages: [{ role: "user", content: prompt }] }),
  });
  const raw = await r.text();
  let data; try { data = JSON.parse(raw); }
  catch { throw new Error(`Anthropic non-JSON: ${raw.slice(0,80)}`); }
  if (!r.ok) throw new Error(data.error?.message || `Anthropic ${r.status}`);
  const text = data.content?.map(c => c.type === "text" ? c.text : "").join("") ?? "";
  if (!text.trim()) throw new Error("Anthropic empty text");
  return { text };
}

const ADAPTERS = { openrouter: callOpenRouter, anthropic: callAnthropic };
```

## 3. Handler — chain runner (AC-1.2 / 1.3 / 1.4 / 4.3)

```js
export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { prompt, chain: chainOverride } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "prompt required" });

  const chain = Array.isArray(chainOverride) && chainOverride.length
    ? chainOverride : defaultChain();                            // AC-5.1

  const failures = [];
  for (const { provider, model } of chain) {
    const adapter = ADAPTERS[provider];
    if (!adapter) { failures.push(`${provider}: unknown provider`); continue; }
    try {
      const { text } = await withTimeout(sig => adapter(prompt, model, sig));
      return res.status(200).json({ text, provider: `${provider}/${model}` }); // AC-2.1
    } catch (e) {
      failures.push(`${provider}/${model}: ${e.message}`);        // AC-1.3 continue
    }
  }
  // distinguish "no keys at all" (AC-4.3) from "all attempts errored" (AC-1.4)
  const allKeyless = failures.every(f => /missing|unknown provider/.test(f));
  return res.status(allKeyless ? 500 : 502)
            .json({ error: allKeyless ? "no LLM provider configured" : "all providers failed",
                    failures });
}
```

> Note: keyless providers are skipped via the adapter throwing "missing" — they still record a
> failure entry, which is how AC-4.3 distinguishes the all-keyless case.

## 4. Frontend rename (AC-3.1 / 3.2)

In `src/App.jsx`:
- Rename `async function callClaude(prompt)` → `async function callLLM(prompt)`. Body unchanged
  (same POST to `/api/chat`, same `{text, provider}` parsing).
- Update both call sites in `handleAnalyze` and `handleAspectChange` (and any other) from
  `callClaude(` → `callLLM(`.
- Header badge logic (`provider.includes("qwen")`) already satisfies AC-2.2 — no change.
- (Optional, AC-5.1 hook) `callLLM(prompt, chain)` may forward an optional `chain` in the body;
  default `undefined` so server uses env chain. No UI wiring in v1.

## 5. README / env docs

Update README "How It Works" + "Environment Variables" to reflect the real chain, the new
`OPENROUTER_MODEL` / `ANTHROPIC_MODEL` / `LLM_CHAIN` overrides, and that OpenRouter (Qwen) is
tried first, Claude fallback.

## 6. Test plan (maps to AC)

Serverless logic is hard to unit-test without a runner; use a thin extraction: move
`defaultChain`, adapters, and a `runChain(prompt, chain, env, fetchImpl)` into
`api/_llm.js` (pure, dependency-injected `fetchImpl` + `env`), and have `chat.js` call it.
Then test `runChain` with a mock fetch:

| Test | Setup | Expect (AC) |
|---|---|---|
| first wins | openrouter returns 200 text | provider `openrouter/...`, anthropic NOT called (1.2) |
| fallback on 500 | openrouter 500, anthropic 200 | provider `anthropic/...` (1.3) |
| fallback on empty | openrouter 200 empty text, anthropic 200 | anthropic used (1.3) |
| fallback on timeout | openrouter aborts, anthropic 200 | anthropic used (1.3) |
| all fail | both 500 | 502 + failures[2] (1.4) |
| keyless skip | no OPENROUTER_API_KEY, anthropic 200 | anthropic used, failure notes missing key (4.2) |
| no keys | neither key set | 500 "no LLM provider configured" (4.3) |
| attribution | qwen model answers | provider string contains `qwen` (2.1/2.2) |
| chain override | body.chain provided | uses override order (5.1) |

Frontend rename verified by `npm run build` (no `callClaude` references remain) + manual run.

## 7. Risks

- R1: Qwen model id drift (Open Q1) — placeholder id must be verified live before deploy, else
  every reading silently falls back to Claude (still works, but defeats the purpose). T-task
  includes a probe step per global "Probe Before Bulk Operations" rule: fire one real request
  to the chosen Qwen id and confirm 200 + non-empty `choices[0].message.content`.
- R2: OpenRouter requires `HTTP-Referer`/`X-Title` headers for some accounts — included.
- R3: Per-call 22s timeout × 2 providers could exceed 30s only if both run to the wire; in
  practice provider 1 fails fast on errors. Acceptable; monitor.
