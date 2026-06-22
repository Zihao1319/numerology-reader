# Requirements — Frontend Showcase (In-Depth Presentation)

## 1. Overview

The engine computes rich per-pair data — transitions, 伏位 elevator, narrative roles, intensity,
and (after magnetic-combination-engine) light/shadow seeds, remedies, and `adjustedPairScore` —
but the UI surfaces ~20% of it as tiny glyphs (↑↓◎✦) and dense one-line rows. The result *reads*
shallow even though the analysis is deep.

This feature re-presents existing data as an in-depth, narrative experience. Two depth sources,
per product decision (2026-06-21):

1. **Visual structure** — a Journey Flow diagram, expandable pair deep-dive cards, a score
   rationale breakdown, and an energy profile.
2. **Longer LLM prose** — richer, more structured readings (more sentences, explicit
   light/shadow framing, added sections).

Scope decision: **single number, one aspect at a time** — enrich the existing view, NOT a 5x
multi-aspect report. Journey Flow is **responsive** (horizontal desktop / vertical mobile).

## 2. Dependencies

- **magnetic-combination-engine** provides `CATEGORY_SEEDS_V2` (light/shadow/domains), per-pair
  remedy/activation flags, `combinations[]`, and `adjustedPairScore`. Pillars B/C consume these.
- Parts that work on TODAY's data (Journey Flow node layout, transition glyphs, energy bars) can
  be built before combo-engine lands; the seed/remedy/adjusted-score details degrade gracefully
  (hidden) until combo-engine is present.
- **llm-provider-config** — prose enrichment bumps `max_tokens`; coordinate the constant.

## 3. User Stories & Acceptance Criteria (EARS)

### US-1 — Journey Flow (signature visual)
As a reader, I want to see the number as a connected visual journey, so the sequence reads like a
story instead of loose chips.

- **AC-1.1** THE SYSTEM SHALL render a Journey Flow showing every pair as a node in sequence
  order, node colour by 吉(green)/凶(red)/伏位(amber)/unknown(grey), node size scaled by intensity.
- **AC-1.2** THE SYSTEM SHALL render connectors between adjacent nodes carrying the transition
  type as a glyph/label (吉→凶 reversal, 凶→吉 recovery, same-category reinforce, 伏位
  amplify↑/deflate↓, compound).
- **AC-1.3** WHEN viewport width ≥ 640px THE flow SHALL lay out horizontally; WHEN < 640px it
  SHALL lay out vertically with meaning text beside each node.
- **AC-1.4** WHEN a node is clicked THE SYSTEM SHALL select that pair and expand its deep-dive
  card (US-2), with a clear selected/highlight state on the node.
- **AC-1.5** WHEN a pair is remedied/unremedied/part of a 連續 run (combo-engine present) THE node
  SHALL carry a status marker (⛨ remedied, ⚠ unremedied, ∥ in-run).

### US-2 — Pair deep-dive cards
As a reader, I want each pair to explain itself in plain language, so I understand *why* it reads
the way it does.

- **AC-2.1** THE SYSTEM SHALL render one expandable card per pair (replacing the dense PairTable).
- **AC-2.2** THE card header SHALL show originalDigits→resolvedPair, category + 吉/凶, intensity
  label, and score (adjustedPairScore as headline; raw pairScore shown as secondary when they
  differ).
- **AC-2.3** WHEN expanded THE card SHALL show: light expression, shadow expression, life-domain
  hits (from CATEGORY_SEEDS_V2), the transition meaning in plain words, 伏位 elevator effect if
  applicable, remedy/activation status, and narrative role.
- **AC-2.4** WHEN combo-engine seeds are absent THE card SHALL fall back to the core seed string
  with no empty/broken sections.
- **AC-2.5** THE pair selected via Journey Flow click (AC-1.4) SHALL auto-expand and scroll into
  view; others may be collapsed by default.

### US-3 — Score rationale
As a reader, I want to see how the final number was built, so the score feels earned, not arbitrary.

- **AC-3.1** THE SYSTEM SHALL render a "How this score was built" panel listing each pair's
  contribution (adjustedPairScore) as a labelled mini-bar.
- **AC-3.2** WHEN a pair's adjustedPairScore differs from its raw pairScore THE panel SHALL show
  the delta and reason (e.g. "remedied +12", "連續 凶 −7", "伏位 dormant +9").
- **AC-3.3** THE panel SHALL show the average, any sequence-level bonuses (生天延 +3, 吉星疊加
  +3), and the final clamped score, so the arithmetic is transparent.
- **AC-3.4** WHEN combo-engine is absent THE panel SHALL still show per-pair contributions and the
  average→final, omitting the modifier/bonus rows.

### US-4 — Energy profile
- **AC-4.1** THE SYSTEM SHALL render a ranked horizontal-bar list of the 8 categories by total
  intensity, each with its 吉/凶 colour, value, and % of total; the dominant field highlighted.
- **AC-4.2** THE energy profile and the existing radar SHALL both be available (radar = shape,
  bars = ranking); empty data SHALL show the existing empty state.

### US-5 — Richer LLM prose
- **AC-5.1** THE base reading SHALL produce more developed text: Journey Reading expanded to 2–3
  sentences per beat-cluster, Cumulative Reading plus a new "DOMINANT THEME" / "KEY TENSION"
  line, and a new "STRENGTHS & RISKS" section (concise paired bullets).
- **AC-5.2** THE aspect reading SHALL expand to 3–4 sentences with explicit light-side vs
  shadow-side framing for any 凶 categories present.
- **AC-5.3** THE renderer (`parseInterpretation`, `SECTION_ICONS`) SHALL recognise and style all
  new section headers; unknown headers SHALL still render with a default icon (no crash).
- **AC-5.4** `max_tokens` SHALL be raised enough to fit the longer output without truncation
  (coordinate with llm-provider-config adapters); the longer prompt SHALL stay within function
  `maxDuration`.

### US-6 — Presentation shell & layout
- **AC-6.1** THE read-mode layout SHALL be reordered for narrative flow: Score hero → Journey Flow
  → Reading → Pair deep-dives → (Energy profile + Radar) → Score rationale → Combinations.
- **AC-6.2** THE SYSTEM SHALL provide richer loading states (per-section skeletons) while base and
  aspect readings stream/resolve, preserving the existing two-call behaviour.
- **AC-6.3** All new components SHALL match the existing visual language (dark `#0a0f1e`/`#0f172a`
  surfaces, `#1e293b` borders, radius 12, amber accent `#f59e0b`) using the project's inline-style
  convention (no new styling lib).

### US-7 — Compatibility & performance
- **AC-7.1** Compare mode SHALL remain functional (may optionally gain a small journey strip;
  not required).
- **AC-7.2** No new heavyweight dependency SHALL be added; Journey Flow uses CSS/flex (+ inline
  SVG connectors if needed), reusing existing `recharts` only for radar.
- **AC-7.3** WHEN analysis is empty (no pairs / Void) all new panels SHALL show graceful empty
  states.

## 4. Non-Functional

- Responsive down to 360px width.
- Pure client-side; no new API calls beyond the existing two (base + aspect).
- Keep `App.jsx` maintainable — extract new components (and ideally move pure engine code to
  `src/engine.js` per combo-engine T1) rather than growing one file unbounded.

## 5. Open Questions

- Q1: Journey Flow connectors — inline SVG (curved, prettier) vs pure CSS flex pseudo-borders
  (simpler, lighter)? Default: **CSS flex** for v1, SVG polish deferred. (design §)
- Q2: Should pair cards default collapsed or expanded on first render? Default: **first pair
  expanded, rest collapsed**; journey click overrides.
- Q3: Energy profile — replace radar or sit beside it? Default: **beside** (both shown).
