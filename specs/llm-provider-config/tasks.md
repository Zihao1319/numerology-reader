# Tasks — Configurable LLM Provider

Ordered. Each maps to AC in requirements.md. `in_progress` before start, `completed` only after
test passes. One at a time.

- [ ] **T0 — Probe Qwen model id** (Open Q1, R1)
  Per global "Probe Before Bulk Operations": with a real `OPENROUTER_API_KEY`, fire ONE request
  to the candidate Qwen id (verify on openrouter.ai/models first). Confirm 200 +
  non-empty `choices[0].message.content`. Record the confirmed id in design.md §1 and as the
  default `OPENROUTER_MODEL`. _Blocker for a meaningful deploy._

- [ ] **T1 — Extract pure chain runner** (testability)
  Create `api/_llm.js` exporting `defaultChain(env)`, `callOpenRouter`, `callAnthropic`,
  `ADAPTERS`, and `runChain({prompt, chain, env, fetchImpl, timeoutMs})`. Pure, DI'd fetch+env.

- [ ] **T2 — Adapters + timeout** (AC-1.3, 4.2, NFR)
  Implement both adapters with `AbortController` per-call timeout; throw on missing key, non-2xx,
  non-JSON, empty text. Tests: keyless skip; empty-text fallback; timeout fallback.

- [ ] **T3 — runChain logic** (AC-1.2, 1.3, 1.4, 4.3, 5.1)
  Implement loop, attribution string, 502 vs 500 distinction, chain override.
  Tests (mock fetch, design §6): first-wins, fallback-on-500, all-fail-502, no-keys-500,
  chain-override, attribution.

- [ ] **T4 — Rewrite api/chat.js to call runChain** (AC-1.1, 2.1, 4.1)
  Thin handler: method guard, body parse, `runChain(...)` with real `fetch`/`process.env`.
  Manual: `vercel dev`, POST a prompt, confirm `provider` reflects the answering model.

- [ ] **T5 — Frontend rename callClaude → callLLM** (AC-3.1, 3.2)
  Rename fn + all call sites in `src/App.jsx`. Confirm no `callClaude` remains
  (`grep callClaude src` empty). `npm run build` clean. App runs, badge shows correct provider.

- [ ] **T6 — README + env docs** (design §5)
  Document chain, model overrides, `LLM_CHAIN`, Qwen-first-Claude-fallback. Remove stale claims.

- [ ] **T7 — Spec audit + CHANGELOG**
  Audit every AC (✅/⚠️/❌) per ~/.claude/spec-audit-process.md. Fix or defer w/ reason.
  Append CHANGELOG entry. Update checkboxes here.

## Definition of done
- All AC ✅ or deferred w/ written reason.
- `runChain` tests green; build clean; no `callClaude` left.
- Qwen id probed live (T0) and confirmed answering (not silently falling back).
- README + CHANGELOG updated.

## Suggested sequencing vs the other feature
This feature is independent of magnetic-combination-engine and can ship first or in parallel —
they touch different code (`api/` + the one fn rename vs `src/engine.js` + UI panels). Only
overlap: both rename/move code in `App.jsx`, so land one, rebase the other.
