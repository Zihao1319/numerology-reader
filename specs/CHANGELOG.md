# Changelog

All notable feature-level changes to the Numerology Reader, one entry per feature per session.

Format:
```
## [YYYY-MM-DD] Feature Name — short description

**Changed:** what was modified and why
**Files:** key files touched
**Spec:** specs/feature-name/
```

---

## [2026-06-21] Implementation — llm-provider-config + magnetic-combination-engine + frontend-showcase

**Changed:** Full implementation of all three specced features in one session.
- `api/_llm.js` — new chain runner with Qwen-first (OpenRouter) → Claude fallback, per-call AbortController timeout, DI'd fetchImpl
- `api/chat.js` — rewritten to use `runChain`, exposes `provider` in response, accepts `chain` override
- `src/engine.js` — extracted all pure logic from App.jsx; added CATEGORY_SEEDS_V2, detectCombinations (生天延/五鬼/adjacency/吉星疊加/伏位activation/連續), applyCombinationScoring (remedied/unremedied/run/dormant modifiers + sequence bonuses), buildCombinationsBlock, updated prompt builders, nodeSize/transitionGlyph/energyRows UI helpers
- `src/engine.test.js` — 40 Vitest tests covering all engine ACs, all green
- `src/App.jsx` — major rewrite: imports engine.js, callClaude→callLLM, removed vestigial API key UI, added JourneyFlow + JourneyNode + JourneyConnector (responsive), CombinationsPanel, PairDeepDive + PairRow (expandable with light/shadow/domains), EnergyProfile, ScoreRationale, new section icons + DOMINANT THEME/KEY TENSION/STRENGTHS & RISKS headers, selectedPairIdx wired across JourneyFlow↔PairDeepDive
- `package.json` + `vite.config.js` — vitest devDep + test script + test environment
**Files:** api/_llm.js, api/chat.js, src/engine.js, src/engine.test.js, src/App.jsx, package.json, vite.config.js
**Spec:** specs/llm-provider-config/, specs/magnetic-combination-engine/, specs/frontend-showcase/

---

## [2026-06-21] Specs authored — combination engine + LLM provider config + frontend showcase

**Changed:** Authored three feature specs (requirements/design/tasks). No code yet — implementation
deferred to a follow-up session (to be done by Sonnet). Key product decisions captured:
combination remedies DO adjust score (v1 default modifiers); Qwen-first LLM chain (Sonnet probes
live id); remedy adjacency = immediate-neighbour (生天延 = sequence-level); frontend depth via
BOTH visual structure + longer prose; single-number view (not multi-aspect report); responsive
Journey Flow. frontend-showcase consumes combo-engine `scoreReasons`/seeds/`adjustedPairScore`
and shares the `max_tokens` constant with llm-provider-config.
**Files:** specs/magnetic-combination-engine/*, specs/llm-provider-config/*, specs/frontend-showcase/*
**Spec:** specs/magnetic-combination-engine/, specs/llm-provider-config/, specs/frontend-showcase/
