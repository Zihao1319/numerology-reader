# Design — Frontend Showcase

> Implements specs/frontend-showcase/requirements.md
> Touches `src/App.jsx` (new components + layout), prompt builders, `api/_llm.js`/`chat.js`
> (`max_tokens`). Assumes engine pure-logic extracted to `src/engine.js` (combo-engine T1).

## 1. Component inventory

New components (all in `App.jsx` or `src/_components/` if extracted), matching existing
inline-style convention:

| Component | Pillar | Consumes |
|---|---|---|
| `JourneyFlow` | A / US-1 | `pairs` (+ flags if present), `selectedIdx`, `onSelect` |
| `JourneyNode` | A | one pair |
| `PairDeepDive` | B / US-2 | `pairs`, `selectedIdx`, `onSelect`, `CATEGORY_SEEDS_V2` |
| `ScoreRationale` | C / US-3 | `analysis` (pairs raw+adjusted, combinations) |
| `EnergyProfile` | D / US-4 | `categoryTotals` |
| `useIsMobile()` hook | A | `window.matchMedia("(max-width:639px)")` |

Reused/updated: `ScoreDisplay` (hero, add band description), `RadarPanel` (unchanged),
`InterpretationPanel` + `parseInterpretation` + `SECTION_ICONS` (new sections),
`CombinationsPanel` (from combo-engine — placed by this layout).

## 2. Pillar A — Journey Flow (AC-1.x)

### 2.1 Layout
`useIsMobile()` switches orientation (AC-1.3):
```js
function useIsMobile() {
  const [m, setM] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width:639px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(max-width:639px)");
    const fn = e => setM(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return m;
}
```
- Desktop: `display:flex; flex-direction:row; overflow-x:auto` — nodes + connectors inline.
- Mobile: `flex-direction:column` — each node row = marker + label + one-line meaning (pulled
  from `CATEGORY_SEEDS_V2[cat].core` or PAIR_DESCRIPTIONS).

### 2.2 Node (AC-1.1, 1.5)
- Size by intensity: diameter `28 + intensity*6` (i1=34 … i4=52). 伏位 elevator nodes hollow ring.
- Colour: 吉 `#16a34a`, 凶 `#dc2626`, 伏位 `#f59e0b`, unknown `#475569`. Fill at 15% opacity,
  border at full.
- Inside: resolvedPair (mono). Below: category + intensity `i{n}`.
- Status marker badge (combo-engine present): ⛨ remediedBy, ⚠ unremedied, ∥ inRun. Hidden if flags
  absent (AC-2.4-style graceful degrade).
- Selected state: 2px amber ring + raised bg.

### 2.3 Connectors (AC-1.2, Open Q1 → CSS flex v1)
Between nodes, a short bar + glyph label derived from `pairs[i].transitionType`:
| transitionType | glyph | label | colour |
|---|---|---|---|
| ausp-to-inaup | ⤵ | reversal | red |
| inaup-to-ausp | ⤴ | recovery | green |
| same-category | ↺ | reinforce | category colour |
| ausp-to-ausp | ⇈ | compound+ | green |
| inaup-to-inaup | ⇊ | compound− | red |
| fuwei-amplify | ↑ | amplify | green |
| fuwei-deflate | ↓ | deflate | grey |
| opening/solo | · | — | grey |

Desktop: horizontal bar between nodes. Mobile: vertical bar on the left rail with glyph.

### 2.4 Selection wiring (AC-1.4)
`App` holds `selectedPairIdx` state. `onSelect(i)` sets it; passed to both `JourneyFlow` and
`PairDeepDive`. Clicking a node sets idx → `PairDeepDive` auto-expands & `scrollIntoView` that
card (ref map). Default `selectedPairIdx = 0` (Open Q2).

## 3. Pillar B — Pair deep-dive (AC-2.x)

`PairDeepDive` renders cards; replaces current `PairTable` body (keep the panel chrome).

Card header (always visible): `digits→pair`, 吉/凶 badge, `category subtitle/subtitleEn`,
intensity label, headline score = `adjustedPairScore ?? pairScore`; if `adjustedPairScore` exists
and ≠ raw, show `raw {pairScore}` muted.

Expanded body (AC-2.3), pulling `CATEGORY_SEEDS_V2[category]`:
```
Light:  <light>
Shadow: <shadow>
Domains: <domains.join(" · ")>
Transition: <plain text from transitionType, reuse buildBrief phrasing>
Elevator: <elevatorEffect description>            (伏位 only)
Status: ⛨ remedied by <remediedBy>  |  ⚠ unremedied — full 凶 force
        伏位 dormant (no 吉 neighbour)            (when activated===false)
Role: <narrativeRole>
```
Fallback (AC-2.4): if `CATEGORY_SEEDS_V2` missing, show `CATEGORY_SEEDS[category]` core string
only; omit Light/Shadow/Domains/Status rows.

Expand/collapse: local `openIdx` synced to `selectedPairIdx` prop via effect; chevron toggle.

## 4. Pillar C — Score rationale (AC-3.x)

`ScoreRationale({ analysis })`:
- For each pair: row with label `pair (category)`, a mini-bar width = `adjustedPairScore`,
  numeric value. If `adjustedPairScore !== pairScore`: show `Δ +/-n — reason`. Reason derived
  from flags: `remediedBy`→"remedied", `unremedied`→"full force", `inRun`→"連續", 伏位
  `activated===false`→"dormant".
- Footer rows: `Average <avg>` → `+生天延 3` / `+吉星疊加 3` (if combinations include them) →
  `Final <finalScore>`.
- Degrade (AC-3.4): no adjusted field → show pairScore bars + average→final only.

Reason/delta strings come from the engine where possible. **Recommendation:** combo-engine's
`applyCombinationScoring` should attach a small `scoreReasons: string[]` per pair so the UI does
not re-derive arithmetic. (Add as a note to combo-engine design §9 — see §7 Coordination.)

## 5. Pillar D — Energy profile (AC-4.x)

`EnergyProfile({ categoryTotals })`:
- Sort 8 categories desc by total. Each: label `cat subtitle`, bar (width = total/maxTotal%),
  colour 吉/凶, value + `Math.round(total/sum*100)%`.
- Dominant (max) row: bold + amber left-accent.
- Empty: reuse "No energy data" state.
- Placed beside `RadarPanel` in a 2-col grid (Open Q3 → beside).

## 6. Pillar Prose — richer readings (AC-5.x)

### 6.1 Base prompt (`buildBasePrompt`)
Change the output spec to:
```
JOURNEY READING
Read sequentially, 2–3 sentences. Name each pair, plain cause-effect.

DOMINANT THEME
One sentence: the single strongest force shaping this number.

KEY TENSION
One sentence: the main internal conflict or trade-off (吉 vs 凶, or 連續 vs remedy).

STRENGTHS & RISKS
Two to three "Strength: … / Risk: …" paired lines, grounded in the actual pairs.

CUMULATIVE READING
One sentence overall energy; one sentence what this number fundamentally represents.
```

### 6.2 Aspect prompt (`buildAspectPrompt`)
- Expand to 3–4 sentences; require explicit light-side vs shadow-side sentence for any 凶 present.

### 6.3 Renderer (AC-5.3)
- Extend `parseInterpretation` headers array with `DOMINANT THEME`, `KEY TENSION`,
  `STRENGTHS & RISKS`.
- Add `SECTION_ICONS`: DOMINANT THEME `🎯`, KEY TENSION `⚖️`, STRENGTHS & RISKS `📊`. Unknown →
  existing `✦` default.
- `STRENGTHS & RISKS` body: render `Strength:`/`Risk:` lines as a two-column or coloured list.

### 6.4 max_tokens (AC-5.4)
Raise `max_tokens` 800 → **1400** in both adapters (`api/_llm.js`). Verify longer prompt + output
stays within `maxDuration: 30`. Coordinate constant with llm-provider-config.

## 7. Coordination with other specs

- **combo-engine:** add `scoreReasons: string[]` per pair in `applyCombinationScoring` (design
  §9) so `ScoreRationale` shows deltas without re-computing. Low-effort add; note in its tasks.
- **llm-provider-config:** `max_tokens` lives in the adapters — single source; this spec only
  changes the value.
- Layout owns where `CombinationsPanel` (combo-engine UI) renders (AC-6.1).

## 8. Read-mode layout (AC-6.1)

```
InputPanel
─ analysis ?
  ScoreDisplay (hero + band description)
  CombinationsPanel            (if combinations.length)
  JourneyFlow                  (signature)
  InterpretationPanel          (longer reading + aspect)
  PairDeepDive
  grid[ EnergyProfile | RadarPanel ]
  ScoreRationale
```
`SequenceDisplay` (raw expanded chips) demoted into a collapsible "raw tokens" detail or kept
small above JourneyFlow — implementer's call; not load-bearing.

## 9. Test / verification plan

Mostly visual; add what is unit-testable:

| Check | Method | AC |
|---|---|---|
| useIsMobile toggles at 640px | unit (mock matchMedia) | 1.3 |
| node size = f(intensity) | unit on a sizing helper | 1.1 |
| transition→glyph map | unit on the mapping fn | 1.2 |
| selecting node expands card idx | RTL/interaction or manual | 1.4/2.5 |
| seeds-absent fallback no crash | render with V1-only data | 2.4/3.4 |
| parseInterpretation new headers | unit on sample text | 5.3 |
| energy profile %/sort | unit on a compute helper | 4.1 |
| no truncation at 1400 tok | manual: long number reading | 5.4 |
| empty/Void graceful | manual: input with no pairs | 7.3 |
| responsive 360–1280 | manual viewport sweep | 1.3/6.3 |

Extract pure helpers (`nodeSize`, `transitionGlyph`, `energyRows`, `useIsMobile`) so they are
unit-testable without rendering.

## 10. Risks

- R1: `App.jsx` already 1100 lines; adding 4+ components risks an unmaintainable file. Mitigate by
  extracting engine (combo-engine T1) and optionally a `src/_components/` dir.
- R2: Prose length vs latency — 1400 tokens on a slow Qwen cold start may approach `maxDuration`.
  Mitigate via the per-call timeout + fallback already in llm-provider-config.
- R3: Doing "Both" (visual + prose) is the largest scope of the three features — sequence it last,
  after combo-engine lands its data and llm-provider-config stabilises the model.
