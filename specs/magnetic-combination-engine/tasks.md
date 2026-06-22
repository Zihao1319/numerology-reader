# Tasks — Magnetic Combination Engine

Ordered. Each task maps to acceptance criteria in requirements.md. Mark `in_progress` before
starting, `completed` only after its test passes. One task at a time.

- [ ] **T0 — Test harness**
  Add Vitest (`npm i -D vitest`) + `"test": "vitest run"` script, OR a plain Node assert
  script if avoiding a dep. Export `analyzeNumber`, `detectCombinations`, `tokenize` from a
  new `src/engine.js` (extract pure logic out of `App.jsx`; `App.jsx` re-imports). 
  _Enables every test below. Maps: testability of all AC._

- [ ] **T1 — Extract engine to src/engine.js**
  Move constants (`LOOKUP`, `CATEGORY_META`, seeds, `AUSPICIOUS`/`INAUSPICIOUS`) and pure
  functions (`expandLetters`, `tokenize`, `annotatePairs`, `computePairScore`, `getScoreBand`,
  `buildBrief`, `analyzeNumber`) into `src/engine.js`. `App.jsx` imports them. No behaviour
  change — run app to confirm parity. _Prereq for clean testing; no AC._

- [ ] **T2 — CATEGORY_SEEDS_V2** (US-4 / AC-4.1)
  Add structured seed objects per design §3. Keep old map until T6 migrates consumers.
  Test: every category has non-empty core/light/shadow and ≥3 domains.

- [ ] **T3 — detectCombinations: 生天延 + 五鬼** (AC-1.1, 1.2, 3.1 partial)
  Implement ordered-triple scan, 延年伏位 alt remedy, 五鬼 status, 連續 scan.
  Tests: 生天延 detected; 五鬼 remedied; 五鬼 unremedied; 連續 五鬼.

- [ ] **T4 — detectCombinations: adjacency remedies + 吉星疊加 + 伏位 activation**
  (AC-1.3, 1.4, 1.5, 2.1, 2.2)
  Tests: 絕命破解; 六煞壓制; 禍害化解; 伏位 dormant; 伏位 activated; 吉星疊加.

- [ ] **T5 — Wire detectCombinations into analyzeNumber** (AC-7.1, 7.2)
  Call `detectCombinations` after `annotatePairs`, merge `pairFlags` onto pairs, attach
  `combinations`. Test: empty-combo number adds combinations:[] and neutral flags, all other
  non-score fields unchanged.

- [ ] **T5b — applyCombinationScoring** (US-6 / AC-6.1–6.5)
  Implement per design §9: `adjustedPairScore` per pair (keep raw `pairScore`), sequence
  bonuses, recompute `finalScore` from adjusted scores, clamp [0,100].
  Tests (design §7 table): no-combo parity (6.5); remedied 凶 softened; unremedied/連續 凶
  lower; dormant 伏位; bounds (6.4); raw pairScore retained (6.2).
  Also emit `scoreReasons: string[]` per pair (one label per modifier applied) for
  frontend-showcase ScoreRationale. Test: remedied fixture has a non-empty scoreReasons entry.

- [ ] **T6 — buildBrief light/shadow/domains + status lines** (AC-4.2)
  Migrate brief to V2 seeds; append remedy/activation status lines per design §4.1.
  Test: brief string contains Light/Shadow/Domains and a Status line for a remedied fixture.

- [ ] **T7 — buildCombinationsBlock + prompt injection** (AC-5.2)
  Add helper; append block to `buildBasePrompt` and `buildAspectPrompt`; add weighting
  instruction. Test: block present for combo fixture, absent (no empty header) for `26`.

- [ ] **T8 — CombinationsPanel component** (AC-5.1)
  Render between Score and the table/radar grid; colour by `kind`; only when combos exist.
  Manual/visual check via `vercel dev` (or `npm run dev`).

- [ ] **T9 — PairTable remedy tags**
  Add ⛨制化 / ⚠未化 / dormant tags driven by pair flags. Visual check.

- [ ] **T10 — Spec audit + CHANGELOG + band re-check**
  Run audit per ~/.claude/spec-audit-process.md against every AC (✅/⚠️/❌). Fix or defer with
  reason. **Re-check score-band distribution** on a sample set after T5b — confirm the
  modifier constants (design §9) don't skew bands; document any re-tune. Append CHANGELOG entry.
  Update this file's checkboxes.

## Definition of done
- All AC ✅ or explicitly deferred with written reason.
- `npm run test` green; app runs.
- No-combo score parity confirmed (AC-6.5); all scores ∈ [0,100] (AC-6.4); raw pairScore retained.
- Score bands re-verified against §9 modifiers.
- CHANGELOG updated.
