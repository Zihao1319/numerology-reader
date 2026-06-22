# Design — Magnetic Combination Engine

> Implements specs/magnetic-combination-engine/requirements.md
> All changes are in `src/App.jsx` unless noted. No backend changes.

## 1. Architecture

Add one new pure pass, `detectCombinations(pairs)`, called inside `analyzeNumber` after
`annotatePairs`. It reads the annotated pair array and returns:

```
{
  combinations: Combination[],     // sequence-level named findings
  pairFlags: Record<number, PairFlag>  // per-pair-index remedy/activation flags
}
```

`analyzeNumber` merges `pairFlags` onto each pair (spread) and attaches `combinations` to the
analysis result. Nothing existing is mutated or removed.

### Data shapes

```js
// Combination (sequence-level)
{
  type: "生天延" | "五鬼制化" | "絕命破解" | "六煞壓制" | "禍害化解" | "吉星疊加" | "連續",
  kind: "remedy" | "stack" | "amplify",
  range: [startIdx, endIdx],       // inclusive pair indices
  remedies: string[],              // categories this combo neutralises (e.g. ["五鬼"])
  category: string | null,         // for 連續 / single-target combos
  runLength: number | null,        // for 連續
  label: string,                   // human display, e.g. "生天延 — 制化五鬼"
}

// PairFlag (merged onto a pair)
{
  remediedBy: string | null,       // category that remedies this pair, else null
  unremedied: boolean,             // true only for inauspicious pairs with no remedy
  activated: boolean | null,       // 伏位 only: activated by adjacent 吉; null for non-伏位
  activatedBy: string | null,      // the activating category
  inRun: boolean,                  // part of a 連續 run
}
```

## 2. Detection algorithm

Let `cats = pairs.map(p => p.category)`. All scans are O(n).

### 2.1 生天延 (AC-1.1) — ordered triple
Slide a window of 3 over `cats`. Match when `[i,i+1,i+2] === ["生氣","天醫","延年"]`.
Emit `{type:"生天延", kind:"remedy", range:[i,i+2], remedies:["五鬼"], label:"生天延 — 制化五鬼"}`.

### 2.2 延年+伏位 alt 五鬼 remedy (AC-1.2)
Detect any adjacent `延年,伏位` or `伏位,延年` pair → record as a secondary 五鬼 remedy source.

### 2.3 五鬼 status (AC-1.2)
For each 五鬼 pair index `j`: it is remedied if a 生天延 run exists anywhere in the sequence
OR a 延年+伏位 adjacency exists. Set `remediedBy` = "生天延" or "延年伏位"; else `unremedied=true`.
Emit one `五鬼制化` combination per remedied 五鬼 (kind:"remedy").

> Per AC-1.1/research, 生天延 制化五鬼 works at sequence level (the protective run anywhere
> disarms the 五鬼). Adjacency-only remedies below are stricter.

### 2.4 絕命 / 六煞 / 禍害 adjacency remedies (AC-1.3/1.4/1.5)
For each inauspicious pair, check immediate left/right neighbour category (per Q2 default):
- 絕命 next to 天醫 → `remediedBy:"天醫"`, emit `絕命破解`.
- 六煞 next to 延年 → `remediedBy:"延年"`, emit `六煞壓制`.
- 禍害 next to 生氣 → `remediedBy:"生氣"`, emit `禍害化解`.
Inauspicious pairs with no remedy → `unremedied=true`.

### 2.5 吉星疊加 (AC-2.1)
Scan for the smallest contiguous run containing all three of 生氣/天醫/延年. If found, emit
`吉星疊加` (kind:"stack") over that range.

### 2.6 伏位 activation (AC-2.2)
For each 伏位 pair, `activated = true` if an immediate neighbour ∈ {生氣,天醫,延年}, with
`activatedBy` set; else `activated=false`. (Non-伏位 pairs get `activated:null`.)

### 2.7 連續 amplification (AC-3.1)
Single left-to-right scan grouping equal consecutive categories. Any run of length ≥2 →
emit `連續` with `category`, `runLength`, `amplified:true`; mark member pairs `inRun=true`.
Skip "unknown" category runs.

## 3. Richer seeds (US-4)

Replace `CATEGORY_SEEDS` (currently `Record<string,string>`) with `CATEGORY_SEEDS_V2`:

```js
const CATEGORY_SEEDS_V2 = {
  "生氣": {
    core: "vitality, new beginnings, benefactors, opportunities",
    light: "breakthroughs, helpful people arriving, fresh starts",
    shadow: "restlessness, impulsiveness, inability to settle",
    domains: ["貴人", "新機遇", "人脈", "活力"],
  },
  "天醫": { core:"wealth, healing, nourishment, wisdom",
    light:"financial accumulation, care, intelligence",
    shadow:"naivety, over-giving, taken advantage of",
    domains:["錢財","婚姻","業績","智慧"] },
  "延年": { core:"longevity, endurance, leadership, commitment",
    light:"sustained effort, authority, long-term results",
    shadow:"stubbornness, rigidity, controlling",
    domains:["事業","專業能力","責任","領導"] },
  "伏位": { core:"stability, stillness, hidden potential, waiting",
    light:"patient accumulation, 一鳴驚人",
    shadow:"stagnation, passivity, missed opportunity",
    domains:["蓄勢","積蓄","延續","被動"] },
  "絕命": { core:"bold decisiveness, high volatility, severance",
    light:"daring pioneer, adventurous, loves travel",
    shadow:"impulsive loss, separation, feast-or-famine",
    domains:["投資","開支","破財","官司","意外"] },
  "五鬼": { core:"unconventional intelligence, unpredictability",
    light:"creative genius, out-of-box, artistic/entertainment talent",
    shadow:"erratic, hidden sabotage, trust issues",
    domains:["變動","異地","偏才","血光"] },
  "六煞": { core:"interpersonal magnetism, entanglement",
    light:"high EQ, charming, strong network, romantic appeal",
    shadow:"affairs, indecision, melancholy, conflict",
    domains:["偏桃花","人緣","憂鬱","時尚"] },
  "禍害": { core:"verbal power, persuasion, mouth energy",
    light:"gifted speaker, salesman, negotiator",
    shadow:"disputes, arguments, losing face, illness",
    domains:["口才","口舌是非","小人","病痛"] },
};
```

`CATEGORY_SEEDS` may be kept as a derived `core`-only map for any legacy reference, or removed
once `buildBrief`/prompts migrate.

## 4. Brief & prompt integration (US-5)

### 4.1 buildBrief
For each pair, replace the single `Meaning:` line with light/shadow + domains pulled from
`CATEGORY_SEEDS_V2`, and append remedy/activation status when flagged:
```
    Light: <light>  | Shadow: <shadow>  | Domains: <domains.join("、")>
    Status: remedied by 生天延   (or)   UNREMEDIED — full 凶 force
    伏位: activated by 天醫       (or)   伏位: dormant (no 吉 neighbour)
```

### 4.2 COMBINATIONS block
New helper `buildCombinationsBlock(combinations)` → appended to both `buildBasePrompt` and
`buildAspectPrompt` after the SEQUENCE block:
```
COMBINATIONS DETECTED:
- 生天延 (pairs 1-3): protective run, 制化五鬼 — neutralises erratic energy
- 連續 五鬼 ×2 (pairs 4-5): amplified — strange/unstable force compounds
- UNREMEDIED 絕命 (pair 6): full volatility, no 天醫 to break it
(omit block entirely if no combinations)
```
Prompt instruction added: "Weight your reading by the COMBINATIONS — a remedied 凶 is
softened; an unremedied or 連續 凶 hits at full force."

## 5. UI — Combinations panel (AC-5.1)

New component `CombinationsPanel({ combinations })`, rendered in Read mode between
`ScoreDisplay` and the `PairTable`/`RadarPanel` grid, only when `combinations.length > 0`.

- Card per combination, colour by `kind`: remedy/stack → green (#16a34a),
  amplify(連續 凶) → red (#dc2626), 連續 吉 → teal.
- Show `label`, affected pair chips (`range`), and a one-line effect.
- Matches existing panel styling (`#0f172a` bg, `#1e293b` border, radius 12).

Also extend `PairTable` rows: when a pair has `remediedBy`, show a small green "⛨ 制化" tag;
when `unremedied`, a red "⚠ 未化" tag; when 伏位 `activated:false`, a grey "dormant" tag.

## 6. Compare mode

`ComparePanel` already calls `analyzeNumber`, so `combinations` is available for free. Optional
(v1.1): show a remedy count badge per ranked number. Not required for AC sign-off.

## 9. Score adjustment (US-6) — `applyCombinationScoring(pairs)`

Runs after `detectCombinations` has merged flags onto pairs. Produces `adjustedPairScore` per
pair (leaving `pairScore` untouched), then `analyzeNumber` computes
`finalScore = clamp(round(avg(adjustedPairScore)), 0, 100)`.

> Note: `pairScore` for 凶 is already low (i4=0…i1=40) and 吉 high (i4=100…i1=60). Modifiers are
> *bounded nudges*, not re-scores — they shift toward/away from neutral so the layer is visible
> but cannot flip a reading wildly.

### Per-pair modifier rules (applied in order, then clamp [0,100])

```
base = pairScore
adj  = base

// 1. Remedy: soften 凶 toward neutral (50)
if (pair is 凶 && pair.remediedBy) {
  // pull 40% of the way to neutral — remedied, not erased
  adj = base + (50 - base) * 0.40
}

// 2. Unremedied 凶: full force — push 20% further toward its floor (0)
else if (pair is 凶 && pair.unremedied) {
  adj = base - base * 0.20
}

// 3. 連續 amplification (can stack with #2 for 連續 凶)
if (pair.inRun) {
  if (pair is 凶) adj = adj - adj * 0.15          // compound downward
  if (pair is 吉) adj = adj + (100 - adj) * 0.15  // compound upward
}

// 4. 伏位 dormant penalty (no 吉 neighbour — dead 蓄勢)
if (pair is 伏位 && pair.activated === false) {
  adj = adj + (50 - adj) * 0.30   // collapse toward neutral stagnation
}

adj = clamp(round(adj), 0, 100)
```

### Sequence-level bonuses (applied to finalScore after averaging)

```
let final = avg(adjustedPairScore)
if (any 生天延 combination)  final += 3   // protective master sequence
if (any 吉星疊加 combination) final += 3   // best auspicious stack
finalScore = clamp(round(final), 0, 100)
```

Magnitudes (0.40 / 0.20 / 0.15 / 0.30 / +3) are the **v1 starting constants** — flagged for
review in the audit (Q1 follow-up). They are intentionally modest so existing score bands
(§ requirements) likely need no re-tuning; the audit MUST re-check band distribution on a sample
set and document any change.

### Fields on each pair after this pass
`pairScore` (raw, unchanged), `adjustedPairScore` (new), `scoreReasons: string[]` (new — human
labels for each modifier applied, e.g. `["remedied +12","連續 凶 −7"]`; empty when no adjustment).
UI score circle + ScoreDisplay use `finalScore` (now combination-aware). PairTable shows
`adjustedPairScore` as the headline number with `pairScore` available on hover/secondary if
desired.

> `scoreReasons` is consumed by **frontend-showcase** `ScoreRationale` (its design §4/§7) so the
> UI does not re-derive the arithmetic. Emit it here as each modifier fires.

## 7. Test plan (maps to AC)

Unit tests (add `src/engine.test.js` + Vitest, or a plain assert script if no test runner yet —
see tasks.md T0):

| Test | Input | Expect |
|---|---|---|
| 生天延 detected | `141319` (14生氣,13天醫,19延年) | combo 生天延 range[0,2], remedies 五鬼 |
| 五鬼 remedied by 生天延 | `18141319` | 五鬼 pair `remediedBy:"生天延"` |
| 五鬼 unremedied | `1818` | 五鬼 pairs `unremedied:true` |
| 絕命 broken | `1213` (12絕命,13天醫) | 絕命 `remediedBy:"天醫"` |
| 六煞 suppressed | `1619` | 六煞 `remediedBy:"延年"` |
| 禍害 dissolved | `1714` | 禍害 `remediedBy:"生氣"` |
| 伏位 dormant | `1111` | 伏位 `activated:false` |
| 伏位 activated | `1114` | 伏位 `activated:true, by 生氣` |
| 連續 五鬼 | `1818` | 連續 combo runLength 2, amplified |
| no combos | `26` | combinations [] , flags neutral |
| no-combo score parity | `26` | adjustedPairScore===pairScore, finalScore===baseline (AC-6.5) |
| remedied 凶 softened | `1213` | 絕命 adjustedPairScore > its raw pairScore (toward 50) (AC-6.3) |
| unremedied 連續 凶 lower | `1818` | each 五鬼 adjustedPairScore < raw pairScore (AC-6.3) |
| dormant 伏位 | `1111` | adjustedPairScore pulled toward 50 (AC-6.3) |
| bounds | extreme inputs | all adjustedPairScore & finalScore ∈ [0,100] (AC-6.4) |
| raw retained | any combo input | pairScore unchanged vs pre-feature value (AC-6.2) |

> Note: exact pair resolution per input must be confirmed against `tokenize` output when
> implementing — the table assumes direct-pair tokenization (no 0/5 rules in these fixtures).

## 8. Risks

- R1: Adjacency vs sequence-level remedy semantics differ by school. We pin: 生天延 =
  sequence-level; 絕命/六煞/禍害 = immediate-neighbour. Documented in §2; revisit if SME disputes.
- R2: 連續 + remedy can both fire on one pair — both flags coexist by design; UI shows both.
