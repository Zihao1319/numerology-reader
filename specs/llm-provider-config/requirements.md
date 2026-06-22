# Requirements — Configurable LLM Provider (callClaude → callLLM)

## 1. Overview

The system is built on Chinese 易經 metaphysics, so Chinese-trained models (Qwen via
OpenRouter) are expected to give richer, more idiomatic readings than Claude. The README and
spec v2.0 *claim* an "OpenRouter-first, Claude fallback" flow, but the live `api/chat.js`
**only calls Anthropic** (the OpenRouter path was reverted — see commit `8894ce6 fix: revert
back to claude`). 

This feature makes the LLM layer **configurable**: a single source of truth for which model(s)
to call and in what priority order, with automatic fallback. Frontend `callClaude` is renamed
to `callLLM`. The user wants to A/B Qwen models against Claude.

## 2. Current State

- `src/App.jsx` → `callClaude(prompt)` POSTs `{prompt}` to `/api/chat`, expects `{text, provider}`.
- `api/chat.js` → hardcoded single call to `claude-sonnet-4-6`, returns
  `provider: "anthropic/claude-sonnet-4-6"`.
- No OpenRouter call exists in code despite README.
- UI header badge already keys off `provider.includes("qwen")` vs Claude (works once provider varies).

## 3. User Stories & Acceptance Criteria (EARS)

### US-1 — Configurable provider chain
As the operator, I want to declare an ordered list of models to try, so I can put Qwen first
and Claude as fallback without code edits per change.

- **AC-1.1** THE SYSTEM SHALL read an ordered provider chain from configuration (env-driven,
  see design), each entry specifying `provider` (`openrouter`|`anthropic`) and `model` id.
- **AC-1.2** WHEN the first provider in the chain returns a successful response, THE SYSTEM
  SHALL return it and NOT call subsequent providers.
- **AC-1.3** WHEN a provider call fails (non-2xx, timeout, network, or empty text), THE SYSTEM
  SHALL fall through to the next provider in the chain.
- **AC-1.4** WHEN all providers in the chain fail, THE SYSTEM SHALL return HTTP 502 with an
  error listing each provider's failure reason.

### US-2 — Provider attribution
- **AC-2.1** THE SYSTEM SHALL return `provider` as `"<provider>/<model>"` for the model that
  actually answered (e.g. `"openrouter/qwen/qwen-2.5-72b-instruct"`).
- **AC-2.2** THE existing header badge SHALL show 🟣 Qwen for any OpenRouter/qwen model and
  🟡 Claude for Anthropic models, unchanged.

### US-3 — Frontend rename
- **AC-3.1** `callClaude` SHALL be renamed `callLLM` across `src/App.jsx`; all call sites
  updated; behaviour (request body, response handling) otherwise unchanged.
- **AC-3.2** THE rename SHALL NOT change the `/api/chat` request/response contract.

### US-4 — Safe key handling
- **AC-4.1** No API key SHALL be exposed to the browser; all model calls SHALL go through the
  `/api/chat` serverless function (unchanged security posture).
- **AC-4.2** WHEN a provider's required key env var is missing, THE SYSTEM SHALL skip that
  provider (treat as unavailable) rather than crash, and continue the chain.
- **AC-4.3** WHEN no provider in the chain has a usable key, THE SYSTEM SHALL return HTTP 500
  "no LLM provider configured".

### US-5 — Per-call overridability (optional, low priority)
- **AC-5.1** WHEN the request body includes an optional `chain` override (array of
  provider/model), THE SYSTEM SHALL use it instead of the env default. Used for A/B testing
  from a future settings UI. (May be deferred; no UI required in v1.)

## 4. Non-Functional

- Keep within Vercel function `maxDuration: 30` already set in `api/chat.js`.
- Each provider call gets its own timeout so one slow provider does not consume the whole
  budget before fallback can run (see design — per-call AbortController).
- No new runtime dependencies (use native `fetch`).

## 5. Out of Scope

- Streaming responses.
- A settings UI for editing the chain (env-config only in v1; per-call `chain` override is the
  hook for it later).
- Cost/latency telemetry persistence.

## 6. Open Questions

- Q1: Exact Qwen model id on OpenRouter — **RESOLVED 2026-06-21 — Sonnet probes live and picks**
  the best current Chinese-capable Qwen (T0). `qwen/qwen3.7-plus` is a dead placeholder; check
  openrouter.ai/models, test Chinese output, then pin the confirmed id as default
  `OPENROUTER_MODEL`.
- Q2: Should fallback trigger on *slow but eventually 200* (timeout) — yes, per AC-1.3 via
  per-call timeout.
