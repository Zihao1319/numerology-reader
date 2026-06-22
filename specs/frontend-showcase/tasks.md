# Tasks — Frontend Showcase

Ordered. Each maps to AC in requirements.md. `in_progress` before start, `completed` only after
its check passes. One at a time. **Sequence this feature LAST** — after magnetic-combination-engine
(data) and llm-provider-config (model) land.

- [ ] **T0 — Prereqs & helpers**
  Confirm engine extracted to `src/engine.js` (combo-engine T1). Add pure helpers + `useIsMobile`
  hook with unit tests: `nodeSize(intensity)`, `transitionGlyph(transitionType)`,
  `energyRows(categoryTotals)`. _Maps: 1.1, 1.2, 1.3, 4.1 testability._

- [ ] **T1 — EnergyProfile** (US-4 / AC-4.1, 4.2, 7.3)
  Ranked bars beside RadarPanel; dominant highlighted; empty state. Self-contained, no combo dep.
  Check: %/sort unit test + visual.

- [ ] **T2 — JourneyFlow + JourneyNode (desktop)** (AC-1.1, 1.2, 1.4)
  Horizontal flow, intensity sizing, transition connectors, click→`onSelect`. Wire
  `selectedPairIdx` in App. Works on today's data (status markers added in T5).
  Check: glyph-map + sizing unit tests; manual click selects.

- [ ] **T3 — Responsive vertical layout** (AC-1.3, 6.3)
  `useIsMobile` switches JourneyFlow to vertical with meaning text. Check: matchMedia mock unit +
  viewport sweep 360–1280.

- [ ] **T4 — PairDeepDive cards** (US-2 / AC-2.1–2.5)
  Expandable cards replacing PairTable body; header + expanded seed/transition/role; sync open
  state to `selectedPairIdx` + scrollIntoView; V1-seed fallback. Check: fallback renders no empty
  sections; node click expands correct card.

- [ ] **T5 — Combo-engine status integration** (AC-1.5, 2.3, 3.2)
  When flags present: node ⛨/⚠/∥ markers, card Status rows, remedy reasons. Graceful when absent.
  _Depends on combo-engine merged._ Check: with combo fixture, markers/Status show; without, hidden.

- [ ] **T6 — ScoreRationale** (US-3 / AC-3.1–3.4)
  Per-pair contribution bars + Δ/reason (prefer combo-engine `scoreReasons`), average + bonuses +
  final. Degrade to pairScore-only when no adjusted data. Check: both modes render; arithmetic
  matches finalScore.

- [ ] **T7 — Prose enrichment: prompts** (US-5 / AC-5.1, 5.2)
  Expand `buildBasePrompt` (Journey 2–3 sent, DOMINANT THEME, KEY TENSION, STRENGTHS & RISKS,
  Cumulative) and `buildAspectPrompt` (3–4 sent, light/shadow framing). Check: live reading shows
  all sections.

- [ ] **T8 — Prose enrichment: renderer + tokens** (AC-5.3, 5.4)
  Extend `parseInterpretation` headers + `SECTION_ICONS`; style STRENGTHS & RISKS lines; raise
  `max_tokens`→1400 in adapters (coordinate llm-provider-config). Check: new headers parse +
  icon; unknown header default icon; no truncation on a long number; within maxDuration.

- [ ] **T9 — Layout reorder + loading skeletons** (US-6 / AC-6.1, 6.2, 6.3)
  Reorder read-mode per design §8; place CombinationsPanel; per-section skeletons; match visual
  language. Check: visual pass, two-call behaviour intact.

- [ ] **T10 — Compatibility sweep** (AC-7.1, 7.2, 7.3)
  Compare mode still works; no new heavy dep; empty/Void graceful across all new panels.

- [ ] **T11 — Spec audit + CHANGELOG**
  Audit every AC (✅/⚠️/❌) per ~/.claude/spec-audit-process.md. Fix or defer w/ reason. Append
  CHANGELOG entry. Update checkboxes.

## Definition of done
- All AC ✅ or deferred w/ written reason.
- Helper unit tests green; `npm run build` clean; app runs.
- Responsive 360–1280 verified; longer prose renders untruncated within maxDuration.
- Compare mode intact; graceful empty states.
- CHANGELOG updated.

## Cross-spec notes
- Needs combo-engine `CATEGORY_SEEDS_V2`, pair flags, `adjustedPairScore`, and (recommended)
  `scoreReasons[]`.
- Shares `max_tokens` constant with llm-provider-config adapters.
