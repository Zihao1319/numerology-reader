# Numerology Reading App — Specification v1.3

> **Handover document for implementing agent**
> System: 八宅飛星 Digit Pair Numerology Reader
> Stack: React + TypeScript + Tailwind + Recharts + Claude Sonnet 4.6 API
> Mode: Stateless, no backend, single-page app

---

## 1. Overview

A stateless React + TypeScript single-page app that analyzes alphanumeric strings using Eastern numerology (八宅飛星 digit pair system). Users input a number/string, select an aspect, and receive a full energy reading with visual radar chart, score out of 100, and AI-generated interpretation.

---

## 2. Functional Requirements

### FR1 — Input Processing

- **FR1.1** Accept any alphanumeric string (letters, digits, mixed)
- **FR1.2** Strip all non-alphanumeric characters (spaces, dashes, dots, hyphens)
- **FR1.3** Expand letters to zero-padded digit strings (A=01, B=02 ... Z=26). Single digit letters A–I always carry a leading 0.
- **FR1.4** Flatten into individual digit character sequence
- **FR1.5** Apply 5-expansion rule (FR2)
- **FR1.6** Detect and flag leading/trailing 0s (FR3)
- **FR1.7** Collapse middle 0s/5s (FR3)
- **FR1.8** Generate sliding window pairs on collapsed sequence
- **FR1.9** Display expanded digit sequence, collapsed sequence, and all pairs to user

### FR2 — 5 Expansion Rule

> Applied FIRST before any other processing.

- **FR2.1** Trailing `5`: extend last non-5 digit by repeating it once. Apply recursively (`115` → `111`, `1155` → `11111`)
- **FR2.2** Leading `5`: extend first non-5 digit by prepending it once. Apply recursively (`511` → `1111`, `5511` → `11111`)
- **FR2.3** Middle `5` (between two non-5 digits): marks those outer digits as a **visible/amplified pair** — noted in narrative only, does NOT affect score
- **FR2.4** `5` with no adjacent non-5 digit (`505`, `555`): collapses to void — no energy, no pairs
- **FR2.5** Priority: always expand 5 before processing 0

### FR3 — 0 Rules

> Applied AFTER 5-expansion.

- **FR3.1** **Trailing `0`**: flag as void ending — **−10 score penalty**. Remove trailing 0 from sequence before pair generation.
- **FR3.2** **Leading `0`**: flag as void beginning — **−5 score penalty**. Keep in sequence for collapse logic.
- **FR3.3** **Middle `0` between two non-0 digits** (`X_0_Y`): collapse — outer digits form the real pair, `0` marks it as **hidden/invisible**. Noted in narrative only, does NOT affect score.
- **FR3.4** **Multiple middle 0s** (`X_00_Y`): same collapse, deeper hidden quality. Noted in narrative only.
- **FR3.5** After collapsing middle 0s, generate sliding window on the collapsed token sequence.

### FR4 — Pair Lookup

- **FR4.1** All pairs reversible — `12` = `21`, same category and intensity
- **FR4.2** Map each pair to one of 8 categories
- **FR4.3** Assign base intensity (1–4), first listed = highest = 4
- **FR4.4** Unknown pairs (no match) → score 50 (neutral), flagged in table

### FR5 — Scoring System

#### Per Pair Score (0–100):

| Intensity | 吉 Score | 凶 Score |
|---|---|---|
| 4 (highest) | 100 | 0 |
| 3 | 75 | 25 |
| 2 | 50 | 50 |
| 1 (lowest) | 25 | 75 |

> Intensity 2 凶 and 吉 both score 50 — perfectly neutral middle ground.
> Unknown pairs score 50 — neutral.

#### Final Score Formula:
```
finalScore = clamp(average(all pair scores) + flagPenalties, 0, 100)
```

#### Flag Penalties:
| Flag | Penalty |
|---|---|
| Void ending (trailing 0) | −10 |
| Void beginning (leading 0) | −5 |

#### Score Bands:
| Score | Label |
|---|---|
| 85–100 | ✨ Excellent |
| 70–84 | 👍 Good |
| 50–69 | 🔶 Mixed |
| 30–49 | ⚠️ Challenging |
| 0–29 | 🔴 Unfavourable |

### FR6 — Aspects

- **FR6.1** User selects exactly one aspect per reading
- **FR6.2** Five aspects: Housing, Career, Wealth, Relationship, Health
- **FR6.3** Aspect passed to AI for context-aware interpretation

### FR7 — Output

- **FR7.1** Score display — prominent, with band label and color
- **FR7.2** Pair breakdown table
- **FR7.3** Radar/star chart (8-axis, intensity-weighted)
- **FR7.4** Journey narrative (entry → development → outcome)
- **FR7.5** Cumulative reading
- **FR7.6** Aspect-specific AI interpretation
- **FR7.7** Special flags displayed: void beginning, void ending, hidden pairs, visible pairs

### FR8 — AI Interpretation

- **FR8.1** Call Claude Sonnet 4.6 API (`claude-sonnet-4-6`)
- **FR8.2** Housing → atmospheric/experiential language
- **FR8.3** Career/Wealth/Health/Relationship → outcome-focused language
- **FR8.4** AI receives: input, expanded sequence, collapsed sequence, all pairs with categories + intensities + modifiers, score, band, flags, aspect
- **FR8.5** Stateless — single prompt per analysis

---

## 3. Alphabet Expansion Table

| Letter | Value | Digits | Special Note |
|---|---|---|---|
| A | 01 | 0,1 | Leading 0 — hidden energy |
| B | 02 | 0,2 | Leading 0 — hidden energy |
| C | 03 | 0,3 | Leading 0 — hidden energy |
| D | 04 | 0,4 | Leading 0 — hidden energy |
| E | 05 | 0,5 | Leading 0 then 5 — hidden then visible extension |
| F | 06 | 0,6 | Leading 0 — hidden energy |
| G | 07 | 0,7 | Leading 0 — hidden energy |
| H | 08 | 0,8 | Leading 0 — hidden energy |
| I | 09 | 0,9 | Leading 0 — hidden energy |
| J | 10 | 1,0 | Trailing 0 within letter — void quality |
| K | 11 | 1,1 | 伏位 pair directly |
| L | 12 | 1,2 | 絕命 pair directly |
| M | 13 | 1,3 | 天醫 pair directly |
| N | 14 | 1,4 | 生氣 pair directly |
| O | 15 | 1,5 | 5 extends 1 → 11 |
| P | 16 | 1,6 | 六煞 pair directly |
| Q | 17 | 1,7 | 禍害 pair directly |
| R | 18 | 1,8 | 五鬼 pair directly |
| S | 19 | 1,9 | 延年 pair directly |
| T | 20 | 2,0 | Trailing 0 within letter — void quality |
| U | 21 | 2,1 | 絕命 pair directly |
| V | 22 | 2,2 | 伏位 pair directly |
| W | 23 | 2,3 | 禍害 pair directly |
| X | 24 | 2,4 | 五鬼 pair directly |
| Y | 25 | 2,5 | 5 extends 2 → 22 |
| Z | 26 | 2,6 | 延年 pair directly |

---

## 4. Processing Pipeline

```
Input string
    ↓
Strip non-alphanumeric
    ↓
Expand letters (A=01 ... Z=26)
    ↓
Flatten to digit array
    ↓
Expand 5s (leading/trailing recursive, middle=visible modifier flag)
    ↓
Detect & flag trailing 0 (void ending, −10 penalty)
Detect & flag leading 0 (void beginning, −5 penalty)
    ↓
Collapse middle 0s (X_0_Y → token [XY:hidden])
    ↓
Sliding window pairs on collapsed token sequence
    ↓
Lookup each pair → category + intensity
    ↓
Score each pair (0–100)
    ↓
finalScore = avg(pair scores) + flag penalties, clamped 0–100
    ↓
Build radar data (sum finalIntensity per category)
    ↓
Call Claude API with full analysis + aspect
    ↓
Render output
```

### Step-by-step examples:

#### `620B`
```
B=02 → digits: 6,2,0,2
5-expansion: none
Flags: none (0 is middle, not leading/trailing)
Collapse: 2_0_2 → token [22:hidden]
Sequence after collapse: 6, [22:hidden]
Pairs: 62, 22
  62 → 延年 吉 intensity 1 → score 25
  22 → 伏位 吉 intensity 4 → score 100 (hidden = narrative only)
avg = (25+100)/2 = 62.5
flagPenalties = 0
finalScore = 63/100 🔶 Mixed
```

#### `131`
```
Digits: 1,3,1
5-expansion: none
Flags: none
Collapse: none
Pairs: 13, 31
  13 → 天醫 吉 intensity 4 → score 100
  31 → 天醫 吉 intensity 4 → score 100
avg = 100
finalScore = 100/100 ✨ Excellent
```

#### `130`
```
Digits: 1,3,0
5-expansion: none
Trailing 0 detected → flag void ending, penalty −10, remove trailing 0
Remaining: 1,3
Pairs: 13
  13 → 天醫 吉 intensity 4 → score 100
avg = 100
finalScore = 100 − 10 = 90/100 ✨ Excellent (but void ending noted)
```

#### `513`
```
Digits: 5,1,3
Leading 5 → extend first non-5 digit (1) → prepend 1 → 1,1,3
Flags: none
Collapse: none
Pairs: 11, 13
  11 → 伏位 吉 intensity 4 → score 100
  13 → 天醫 吉 intensity 4 → score 100
avg = 100
finalScore = 100/100 ✨ Excellent
```

#### `498J`
```
J=10 → digits: 4,9,8,1,0
5-expansion: none
Trailing 0 → flag void ending, penalty −10, remove trailing 0
Remaining: 4,9,8,1
Collapse: none
Pairs: 49, 98, 81
  49 → 天醫 吉 intensity 2 → score 50
  98 → 禍害 凶 intensity 3 → score 25
  81 → 五鬼 凶 intensity 4 → score 0
avg = (50+25+0)/3 = 25
flagPenalties = −10
finalScore = clamp(25−10, 0, 100) = 15/100 🔴 Unfavourable
```

#### `505`
```
Digits: 5,0,5
Leading 5: no non-5 digit → void
Trailing 5: no non-5 digit → void
Result: complete void — no pairs
Score: 0/100 🔴 (special case: display "no energy to read")
```

---

## 5. Data Model

```typescript
type Category =
  | "生氣" | "天醫" | "延年" | "伏位"   // 吉
  | "絕命" | "五鬼" | "六煞" | "禍害"   // 凶

type CategoryType = "吉" | "凶"
type Modifier = "hidden" | "double-hidden" | "visible" | null
type Aspect = "Housing" | "Career" | "Wealth" | "Relationship" | "Health"
type SpecialFlag = "void-beginning" | "void-ending"
type ScoreBand = "Excellent" | "Good" | "Mixed" | "Challenging" | "Unfavourable"

type PairResult = {
  pair: string                      // e.g. "22"
  rawDigits: string[]               // original digits e.g. ["2","0","2"]
  category: Category | "unknown"
  categoryType: CategoryType | null
  baseIntensity: 1 | 2 | 3 | 4 | null
  modifier: Modifier
  modifierDescription: string | null
  pairScore: number                 // 0–100
  description: string               // one-line energy description
}

type AnalysisResult = {
  input: string
  rawDigitSequence: string[]        // after letter expansion
  processedSequence: string[]       // after 5-expansion and 0-collapse
  pairs: PairResult[]
  specialFlags: SpecialFlag[]
  flagPenalty: number               // sum of flag penalties
  averagePairScore: number          // avg before penalties
  finalScore: number                // 0–100
  scoreBand: ScoreBand
  categoryTotals: Record<Category, number>   // sum of baseIntensity per category (for radar)
  auspiciousTotal: number
  inauspiciousTotal: number
}
```

---

## 6. Lookup Table

### 四吉數 Auspicious

| Category | Subtitle | Pairs (intensity 4→1) |
|---|---|---|
| 生氣 | 貴人 Benefactor | 14/41 → 67/76 → 93/39 → 82/28 |
| 天醫 | 財富 Wealth | 13/31 → 68/86 → 49/94 → 72/27 |
| 延年 | 責任 Longevity | 19/91 → 87/78 → 34/43 → 26/62 |
| 伏位 | 固執 Stability | 11/22 → 88/99 → 77/66 → 33/44 |

> **伏位 note:** 11 and 22 share intensity rank 4 as yin/yang mirrors. Same applies to 88/99, 77/66, 33/44.

### 四凶數 Inauspicious

| Category | Subtitle | Pairs (intensity 4→1) |
|---|---|---|
| 絕命 | 波動 Volatility | 12/21 → 69/96 → 84/48 → 37/73 |
| 五鬼 | 詭異 Erratic | 18/81 → 79/97 → 42/24 → 36/63 |
| 六煞 | 矛盾 Conflict | 16/61 → 47/74 → 38/83 → 92/29 |
| 禍害 | 衝擊 Impact | 17/71 → 89/98 → 46/64 → 23/32 |

### TypeScript Lookup Map

```typescript
const LOOKUP: Record<string, { category: Category; intensity: 1 | 2 | 3 | 4 }> = {
  // 生氣
  "14": { category: "生氣", intensity: 4 }, "41": { category: "生氣", intensity: 4 },
  "67": { category: "生氣", intensity: 3 }, "76": { category: "生氣", intensity: 3 },
  "93": { category: "生氣", intensity: 2 }, "39": { category: "生氣", intensity: 2 },
  "82": { category: "生氣", intensity: 1 }, "28": { category: "生氣", intensity: 1 },
  // 天醫
  "13": { category: "天醫", intensity: 4 }, "31": { category: "天醫", intensity: 4 },
  "68": { category: "天醫", intensity: 3 }, "86": { category: "天醫", intensity: 3 },
  "49": { category: "天醫", intensity: 2 }, "94": { category: "天醫", intensity: 2 },
  "72": { category: "天醫", intensity: 1 }, "27": { category: "天醫", intensity: 1 },
  // 延年
  "19": { category: "延年", intensity: 4 }, "91": { category: "延年", intensity: 4 },
  "87": { category: "延年", intensity: 3 }, "78": { category: "延年", intensity: 3 },
  "34": { category: "延年", intensity: 2 }, "43": { category: "延年", intensity: 2 },
  "26": { category: "延年", intensity: 1 }, "62": { category: "延年", intensity: 1 },
  // 伏位
  "11": { category: "伏位", intensity: 4 }, "22": { category: "伏位", intensity: 4 },
  "88": { category: "伏位", intensity: 3 }, "99": { category: "伏位", intensity: 3 },
  "77": { category: "伏位", intensity: 2 }, "66": { category: "伏位", intensity: 2 },
  "33": { category: "伏位", intensity: 1 }, "44": { category: "伏位", intensity: 1 },
  // 絕命
  "12": { category: "絕命", intensity: 4 }, "21": { category: "絕命", intensity: 4 },
  "69": { category: "絕命", intensity: 3 }, "96": { category: "絕命", intensity: 3 },
  "84": { category: "絕命", intensity: 2 }, "48": { category: "絕命", intensity: 2 },
  "37": { category: "絕命", intensity: 1 }, "73": { category: "絕命", intensity: 1 },
  // 五鬼
  "18": { category: "五鬼", intensity: 4 }, "81": { category: "五鬼", intensity: 4 },
  "79": { category: "五鬼", intensity: 3 }, "97": { category: "五鬼", intensity: 3 },
  "42": { category: "五鬼", intensity: 2 }, "24": { category: "五鬼", intensity: 2 },
  "36": { category: "五鬼", intensity: 1 }, "63": { category: "五鬼", intensity: 1 },
  // 六煞
  "16": { category: "六煞", intensity: 4 }, "61": { category: "六煞", intensity: 4 },
  "47": { category: "六煞", intensity: 3 }, "74": { category: "六煞", intensity: 3 },
  "38": { category: "六煞", intensity: 2 }, "83": { category: "六煞", intensity: 2 },
  "92": { category: "六煞", intensity: 1 }, "29": { category: "六煞", intensity: 1 },
  // 禍害
  "17": { category: "禍害", intensity: 4 }, "71": { category: "禍害", intensity: 4 },
  "89": { category: "禍害", intensity: 3 }, "98": { category: "禍害", intensity: 3 },
  "46": { category: "禍害", intensity: 2 }, "64": { category: "禍害", intensity: 2 },
  "23": { category: "禍害", intensity: 1 }, "32": { category: "禍害", intensity: 1 },
}
```

---

## 7. Pair Score Table

```typescript
function getPairScore(category: Category | "unknown", intensity: 1|2|3|4|null): number {
  if (category === "unknown" || intensity === null) return 50 // neutral
  const isAuspicious = ["生氣","天醫","延年","伏位"].includes(category)
  if (isAuspicious) {
    return { 4: 100, 3: 75, 2: 50, 1: 25 }[intensity]
  } else {
    return { 4: 0, 3: 25, 2: 50, 1: 75 }[intensity]
  }
}
```

---

## 8. Radar Chart Specification

- **Shape:** Octagon — 8 axes evenly spaced at 45°
- **Library:** Recharts `RadarChart`
- **Axis value:** Sum of `baseIntensity` across all pairs in that category
- **Axis order (clockwise from top):**
  1. 生氣 ↔ 絕命 (opposite)
  2. 天醫 ↔ 五鬼 (opposite)
  3. 延年 ↔ 六煞 (opposite)
  4. 伏位 ↔ 禍害 (opposite)
- **Colors:** 吉 = green (`#16a34a`), 凶 = red (`#dc2626`)
- **Two overlays:** one 吉 shape, one 凶 shape
- **Max scale:** 20 (dynamic if exceeded)

---

## 9. AI Prompt Template

```
You are an Eastern numerology interpreter specializing in the 八宅飛星 digit pair system.

Input string: {inputString}
Expanded digit sequence: {rawDigitSequence}
Processed sequence (after 0/5 rules): {processedSequence}
Selected aspect: {aspect}
Final score: {finalScore}/100 ({scoreBand})
Special flags: {specialFlags}

Pair-by-pair analysis:
{pairBreakdown}
Format per pair: [pair] → [category] [subtitle] | Type: [吉/凶] | Intensity: [n] | Modifier: [modifier or none] | Pair score: [n]

Category energy totals (for context):
{categorySummary}

Auspicious total intensity: {auspiciousTotal}
Inauspicious total intensity: {inauspiciousTotal}

Please provide three sections:

1. JOURNEY READING
Narrative arc: first pair = entry, middle = development, last = outcome.
Note void-beginning or void-ending flags if present. 2–3 sentences.

2. CUMULATIVE READING
Overall energy. Dominant feeling. 吉/凶 balance. What this number represents at its core. 2–3 sentences.

3. {aspect} INTERPRETATION
{aspectGuidance}
3–4 sentences. Specific and vivid. Reference actual pairs and categories.

Modifier tone guidance:
- Hidden (0): energy is latent, subtle — real but not immediately obvious
- Visible (5): energy is overt, amplified, undeniable
- Double hidden (00): deeply buried, slow to surface
- Void ending (trailing 0): dissipation, things don't conclude well, −10 to score
- Void beginning (leading 0): starts from nothing, slow activation, −5 to score

Tone: Thoughtful and grounded. Not alarmist. Acknowledge both 吉 and 凶 honestly.
```

### Aspect Guidance Inserts

| Aspect | Guidance |
|---|---|
| Housing | How does this space feel to live in? Atmospheric and experiential. Address harmony, peace, unease, conflict, stagnation, vitality, warmth, creepiness as relevant. |
| Career | Momentum, obstacles, recognition, benefactor support, competition, visibility, stability vs turbulence. |
| Wealth | Accumulation patterns, cash flow, income volatility, risk of loss, wealth generation. |
| Relationship | Harmony vs conflict, emotional depth, attraction, stability, communication, power dynamics. |
| Health | Vitality, recovery capacity, chronic patterns, mental and emotional state. |

---

## 10. UI Design

### Layout

```
┌─────────────────────────────────────────────┐
│  🔢 八宅飛星 Numerology Reader               │
│  ──────────────────────────────────────────  │
│  [Input field: alphanumeric]                 │
│  Aspect: [🏠][💼][💰][❤️][🏥]              │
│  [Analyze]                                   │
│  ──────────────────────────────────────────  │
│  Expanded:  6 · 2 · 0 · 2                   │
│  Processed: 6 · [22:hidden]                  │
│  Pairs: 62 | 22(hidden)                      │
│  Flags: none                                 │
│  ──────────────────────────────────────────  │
│  ┌─────────────────────────────────────┐     │
│  │     SCORE: 63/100  🔶 Mixed         │     │
│  └─────────────────────────────────────┘     │
│  ──────────────────────────────────────────  │
│  [Pair Breakdown Table]                      │
│  ──────────────────────────────────────────  │
│           [Radar Chart]                      │
│  ──────────────────────────────────────────  │
│  🔀 Journey Reading                          │
│  ∑  Cumulative Reading                       │
│  ✦  {Aspect} Interpretation                 │
└─────────────────────────────────────────────┘
```

### Score Display
- Large, prominent number
- Color coded by band: green (85+), teal (70–84), amber (50–69), orange (30–49), red (0–29)
- Band label below score
- Flag penalties shown if applicable (e.g. "−10 void ending")

### Pair Breakdown Table

| Pair | Raw | Category | Type | Intensity | Modifier | Score |
|---|---|---|---|---|---|---|
| 62 | 6,2 | 延年 責任 | 吉 | 1 | — | 25 |
| 22 | 2,0,2 | 伏位 固執 | 吉 | 4 | hidden | 100 |

### Color Scheme

| Element | Color |
|---|---|
| 吉 | `#16a34a` green |
| 凶 | `#dc2626` red |
| Modifier hidden (0) | Muted grey |
| Modifier visible (5) | Gold `#d97706` |
| Void flag | Orange `#ea580c` |
| Score Excellent | `#16a34a` |
| Score Good | `#0d9488` teal |
| Score Mixed | `#d97706` amber |
| Score Challenging | `#ea580c` orange |
| Score Unfavourable | `#dc2626` red |
| Background | `#0f172a` |
| Card | `#1e293b` |
| Text primary | `#f1f5f9` |
| Text secondary | `#94a3b8` |

---

## 11. Task Breakdown for Implementing Agent

### T1 — Data Layer
- [ ] Define all TypeScript types
- [ ] Implement `LOOKUP` map (64 entries)
- [ ] Implement `expandLetters(input: string): string[]` — A=01...Z=26
- [ ] Implement `expandFives(digits: string[]): string[]` — recursive leading/trailing, middle flag
- [ ] Implement `detectFlags(digits: string[]): { flags: SpecialFlag[]; penalty: number; cleaned: string[] }` — trailing/leading 0 detection and removal
- [ ] Implement `collapseMiddleZeros(digits: string[]): Token[]` — X_0_Y → [XY:hidden] token
- [ ] Implement `generatePairs(tokens: Token[]): RawPair[]` — sliding window on tokens
- [ ] Implement `lookupPair(pair: RawPair): PairResult` — category + intensity + modifier
- [ ] Implement `getPairScore(category, intensity): number` — 0–100 per pair
- [ ] Implement `calculateScore(pairs: PairResult[], penalty: number): number` — avg + penalties, clamped
- [ ] Implement `getScoreBand(score: number): ScoreBand`
- [ ] Implement `analyzeNumber(input: string): AnalysisResult` — full pipeline

### T2 — Radar Chart
- [ ] Implement `buildRadarData(totals: Record<Category, number>): RadarDataPoint[]`
- [ ] Dual-overlay RadarChart (吉 green / 凶 red)
- [ ] Correct axis order (吉/凶 facing each other)
- [ ] Dynamic max scale

### T3 — AI Integration
- [ ] Implement `buildPrompt(analysis: AnalysisResult, aspect: Aspect): string`
- [ ] Implement `callClaude(prompt: string): Promise<string>`
- [ ] Parse response into 3 sections (Journey / Cumulative / Aspect)
- [ ] Loading and error states

### T4 — UI Components
- [ ] `InputPanel`: input + aspect buttons + analyze button
- [ ] `SequenceDisplay`: raw → expanded → processed → pairs → flags
- [ ] `ScoreDisplay`: large score number + band + flag penalty breakdown
- [ ] `PairTable`: color-coded breakdown
- [ ] `RadarPanel`: dual-color chart + legend
- [ ] `InterpretationPanel`: 3-section AI output with section headers
- [ ] `LoadingState`: skeleton for AI panel

### T5 — Edge Cases
- [ ] `505`, `555` → void, no pairs → score 0, show "no energy" message
- [ ] Single digit → no pairs → show "minimum 2 digits" message
- [ ] All zeros → void → score 0
- [ ] No aspect selected → disable Analyze button
- [ ] Mixed case → normalize uppercase
- [ ] Very long input → no truncation, process all pairs
- [ ] Letters E(05), J(10), O(15), T(20), Y(25) → verify special handling

---

## 12. Stress Test Suite

| Input | Pairs | Avg | Penalty | Final | Band |
|---|---|---|---|---|---|
| `13` | 13(100) | 100 | 0 | 100 | ✨ Excellent |
| `12` | 12(0) | 0 | 0 | 0 | 🔴 Unfavourable |
| `131` | 13(100)+31(100) | 100 | 0 | 100 | ✨ Excellent |
| `130` | 13(100) | 100 | −10 | 90 | ✨ Excellent |
| `513` | 11(100)+13(100) | 100 | 0 | 100 | ✨ Excellent |
| `620B` | 62(25)+22(100) | 62.5 | 0 | 63 | 🔶 Mixed |
| `498J` | 49(50)+98(25)+81(0) | 25 | −10 | 15 | 🔴 Unfavourable |
| `37` | 37(75) | 75 | 0 | 75 | 👍 Good |
| `1312` | 13(100)+31(100)+12(0) | 67 | 0 | 67 | 🔶 Mixed |
| `505` | none | — | — | 0 | 🔴 Void |

---

*Spec version 1.3 — Ready for implementation*
