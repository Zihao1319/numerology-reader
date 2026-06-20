# Numerology Reading App — Specification v1.2

> **Handover document for implementing agent**
> System: 八宅飛星 Digit Pair Numerology Reader
> Stack: React + TypeScript + Tailwind + Recharts + Claude Sonnet 4.6 API
> Mode: Stateless, no backend, single-page app

---

## 1. Overview

A stateless React + TypeScript single-page app that analyzes alphanumeric strings using Eastern numerology (八宅飛星 digit pair system). Users input a number/string, select an aspect, and receive a full energy reading with visual radar chart and AI-generated interpretation.

---

## 2. Functional Requirements

### FR1 — Input Processing

- **FR1.1** Accept any alphanumeric string (letters, digits, mixed)
- **FR1.2** Strip all non-alphanumeric characters (spaces, dashes, dots, hyphens)
- **FR1.3** Expand letters to zero-padded digit strings:
  - A=01, B=02, C=03, D=04, E=05, F=06, G=07, H=08, I=09
  - J=10, K=11, L=12, M=13, N=14, O=15, P=16, Q=17, R=18, S=19
  - T=20, U=21, V=22, W=23, X=24, Y=25, Z=26
  - **Single digit letters (A–I) always carry a leading 0** — this is intentional and affects modifier logic
- **FR1.4** Flatten into individual digit character sequence
- **FR1.5** Apply 5-expansion rule (see FR2)
- **FR1.6** Flag leading/trailing 0s (see FR3)
- **FR1.7** Generate sliding window pairs from processed sequence
- **FR1.8** Display expanded digit sequence and all pairs to user before analysis

### FR2 — 5 Expansion Rule

> `5` always extends/repeats the adjacent non-5 digit. Applied **before** pair generation.

- **FR2.1** Trailing `5`: extend last non-5 digit — repeat it once more. Apply recursively if multiple trailing 5s (`115` → `111`, `1155` → `11111`)
- **FR2.2** Leading `5`: extend first non-5 digit — prepend it once more. Apply recursively (`511` → `1111`, `5511` → `11111`)
- **FR2.3** Middle `5` (between two digits): `5` acts as **visible/amplified modifier** — outer digits form the real pair, `5` signals overt expression
- **FR2.4** If `5` has no adjacent non-5 digit to extend (e.g. `505`, `555`): collapses to nothing — no real digit to extend, treat as void
- **FR2.5** Priority: expand `5` first, then process `0` rules

### FR3 — 0 Modifier Rules

> Applied after 5-expansion. `0` = invisible/latent/void.

- **FR3.1** **Trailing `0`**: journey ends in void — bad ending. Flag as "void ending" note. Do not generate a pair from trailing 0.
- **FR3.2** **Leading `0`**: journey starts from void/nothing. Flag as "void beginning" note.
- **FR3.3** **Middle `0` between two non-0 digits** (`X_0_Y`): outer digits form the real pair, `0` = hidden/invisible modifier. Intensity reduced by 1 (floor 0.5).
- **FR3.4** **Multiple middle 0s** (`X_00_Y`): same rule, amplified hidden quality. Intensity reduced by 2 (floor 0.5).
- **FR3.5** If both `0` and `5` appear between same outer digits: `5` (visible) takes precedence over `0` (invisible).

### FR4 — Pair Lookup

- **FR4.1** All pairs are **reversible** — `12` and `21` map to same category and intensity
- **FR4.2** Map each pair to one of 8 categories (see Lookup Table)
- **FR4.3** Assign base intensity (1–4) based on position within category (first listed = highest = 4)
- **FR4.4** Unrecognized pairs (no table match, or pairs containing unresolved 0/5) flagged as `"unknown"`

### FR5 — Modified Intensity

- **FR5.1** Middle `0` between pair: finalIntensity = baseIntensity − 1 (floor 0.5)
- **FR5.2** Middle `5` between pair: finalIntensity = baseIntensity + 1 (ceiling 5)
- **FR5.3** No modifier: finalIntensity = baseIntensity
- **FR5.4** Modified final intensity used for radar chart weighting and narrative tone

### FR6 — Aspects

- **FR6.1** User selects exactly one aspect per reading
- **FR6.2** Five aspects: Housing, Career, Wealth, Relationship, Health
- **FR6.3** Selected aspect passed to AI as context for interpretation

### FR7 — Output

- **FR7.1** Pair breakdown table (per pair: digits, category, 吉/凶 type, base intensity, modifier, final intensity, one-line description)
- **FR7.2** Radar/star chart (8-axis, intensity-weighted, colored by 吉/凶)
- **FR7.3** Journey narrative (sequential: entry → development → outcome)
- **FR7.4** Cumulative reading (dominant energies, 吉 vs 凶 balance, net assessment)
- **FR7.5** Aspect-specific AI interpretation
- **FR7.6** Special flags displayed: void beginning, void ending, 5-extension notes

### FR8 — AI Interpretation

- **FR8.1** Call Claude Sonnet 4.6 API (`claude-sonnet-4-6`)
- **FR8.2** Housing → atmospheric/experiential language
- **FR8.3** Career/Wealth/Health/Relationship → outcome-focused language
- **FR8.4** AI receives: input string, expanded digit sequence, all pairs with categories + intensities + modifiers, special flags, selected aspect, 吉/凶 balance
- **FR8.5** Stateless — single prompt per analysis, no history

---

## 3. Alphabet Expansion Table

| Letter | Value | Digits | Note |
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
| J | 10 | 1,0 | Trailing 0 — void ending to 1 |
| K | 11 | 1,1 | 伏位 pair directly |
| L | 12 | 1,2 | 絕命 pair directly |
| M | 13 | 1,3 | 天醫 pair directly |
| N | 14 | 1,4 | 生氣 pair directly |
| O | 15 | 1,5 | 5 extends 1 → 11 |
| P | 16 | 1,6 | 六煞 pair directly |
| Q | 17 | 1,7 | 禍害 pair directly |
| R | 18 | 1,8 | 五鬼 pair directly |
| S | 19 | 1,9 | 延年 pair directly |
| T | 20 | 2,0 | Trailing 0 — void ending to 2 |
| U | 21 | 2,1 | 絕命 pair directly |
| V | 22 | 2,2 | 伏位 pair directly |
| W | 23 | 2,3 | 禍害 pair directly |
| X | 24 | 2,4 | 五鬼 pair directly |
| Y | 25 | 2,5 | 5 extends 2 → 22 |
| Z | 26 | 2,6 | 延年 pair directly |

> **Special letters to note:**
> - **E (05):** leading 0 (hidden) followed by 5 — the 5 then tries to extend the next digit
> - **J (10), T (20):** contain trailing 0 within the letter itself — void quality embedded
> - **O (15), Y (25):** contain 5 — extend adjacent digit

---

## 4. Processing Pipeline

### Step-by-step with example: `620B`

```
Input: "620B"
Step 1 — Strip non-alphanumeric: "620B"
Step 2 — Expand letters: B=02 → "620" + "02" = "62002" → digits: 6,2,0,0,2
Step 3 — Expand 5s: none present, skip
Step 4 — Identify 0 patterns:
  - digits: 6, 2, 0, 0, 2
  - middle 00 between 2 and 2 → real pair: 22, double hidden modifier
  - no leading 0, no trailing 0
Step 5 — Generate pairs:
  - 62 (direct pair)
  - 22 (from 2_00_2, double hidden modifier)
Step 6 — Lookup and apply modifiers
```

### Step-by-step with example: `115`

```
Input: "115"
Step 1 — digits: 1,1,5
Step 2 — Trailing 5: extend last non-5 digit (1) → append 1 → digits: 1,1,1
Step 3 — No 0s present
Step 4 — Pairs: 11, 11
```

### Step-by-step with example: `5112`

```
Input: "5112"
Step 1 — digits: 5,1,1,2
Step 2 — Leading 5: extend first non-5 digit (1) → prepend 1 → digits: 1,1,1,2
Step 3 — No 0s
Step 4 — Pairs: 11, 11, 12
```

### Step-by-step with example: `101`

```
Input: "101"
Step 1 — digits: 1,0,1
Step 2 — No 5s
Step 3 — Middle 0 between 1 and 1 → real pair: 11, hidden modifier (intensity −1)
Step 4 — Pairs: 11 (hidden)
```

### Step-by-step with example: `151`

```
Input: "151"
Step 1 — digits: 1,5,1
Step 2 — Middle 5 between 1 and 1 → real pair: 11, visible modifier (intensity +1)
Step 4 — Pairs: 11 (visible/amplified)
```

### Step-by-step with example: `505`

```
Input: "505"
Step 1 — digits: 5,0,5
Step 2 — Leading 5: no non-5 digit to left → void
         Trailing 5: no non-5 digit to right → void
Step 3 — Collapses to: 0 (void only)
Step 4 — No pairs. Flag: void with no energy.
```

---

## 5. Data Model

### Types

```typescript
type Category =
  | "生氣" | "天醫" | "延年" | "伏位"   // 吉 Auspicious
  | "絕命" | "五鬼" | "六煞" | "禍害"   // 凶 Inauspicious

type CategoryType = "吉" | "凶"

type Modifier = "hidden" | "visible" | "double-hidden" | null

type Aspect = "Housing" | "Career" | "Wealth" | "Relationship" | "Health"

type SpecialFlag = "void-beginning" | "void-ending" | "five-extension-leading" | "five-extension-trailing"

type PairResult = {
  pair: string                      // e.g. "22"
  rawDigits: string[]               // original digits that formed this pair e.g. ["2","0","0","2"]
  category: Category | "unknown"
  categoryType: CategoryType | null
  baseIntensity: 1 | 2 | 3 | 4 | null
  modifier: Modifier
  modifierDescription: string | null  // e.g. "0 between digits — hidden expression"
  finalIntensity: number | null       // 0.5–5, null if unknown
  description: string                 // one-line energy description
}

type AnalysisResult = {
  input: string
  digitSequence: string[]             // after letter expansion, before 5/0 processing
  processedSequence: string[]         // after all processing
  pairs: PairResult[]
  specialFlags: SpecialFlag[]
  categoryTotals: Record<Category, number>
  auspiciousTotal: number
  inauspiciousTotal: number
  dominantCategories: Category[]
}
```

---

## 6. Lookup Table

### 四吉數 Auspicious

| Category | Subtitle | Pairs (descending intensity 4→1) |
|---|---|---|
| 生氣 | 貴人 Benefactor | 14/41 → 67/76 → 93/39 → 82/28 |
| 天醫 | 財富 Wealth | 13/31 → 68/86 → 49/94 → 72/27 |
| 延年 | 責任 Longevity | 19/91 → 87/78 → 34/43 → 26/62 |
| 伏位 | 固執 Stability | 11/22 → 88/99 → 77/66 → 33/44 |

> **伏位 note:** `11` and `22` share intensity rank 4. `88` and `99` share rank 3. `77` and `66` share rank 2. `33` and `44` share rank 1. They are yin/yang mirror expressions of the same energy level.

### 四凶數 Inauspicious

| Category | Subtitle | Pairs (descending intensity 4→1) |
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

## 7. Modifier Rules Summary

| Position | Digit | Effect | Intensity Change |
|---|---|---|---|
| Middle (X_0_Y) | `0` | Hidden — outer digits form pair, invisible expression | −1 (floor 0.5) |
| Middle (X_00_Y) | `00` | Double hidden — amplified invisibility | −2 (floor 0.5) |
| Middle (X_5_Y) | `5` | Visible — outer digits form pair, amplified expression | +1 (ceiling 5) |
| Leading | `0` | Void beginning — journey starts from nothing | Flag only |
| Trailing | `0` | Void ending — journey ends in nothing (bad) | Flag only |
| Leading | `5` | Extend first non-5 digit recursively | Restructures sequence |
| Trailing | `5` | Extend last non-5 digit recursively | Restructures sequence |
| Conflict (both 0 and 5 middle) | — | `5` (visible) wins | +1 |

---

## 8. Radar Chart Specification

- **Shape:** Octagon — 8 axes evenly spaced at 45°
- **Library:** Recharts `RadarChart`
- **Axis order (clockwise from top):**
  1. 生氣 (top) ↔ opposite: 絕命 (bottom)
  2. 天醫 ↔ opposite: 五鬼
  3. 延年 ↔ opposite: 六煞
  4. 伏位 ↔ opposite: 禍害
- **Value per axis:** Sum of `finalIntensity` across all pairs in that category
- **Max scale:** 20 (adjust dynamically if exceeded)
- **Colors:**
  - 吉 axes + fill: green (`#16a34a`)
  - 凶 axes + fill: red (`#dc2626`)
  - Render two separate radar overlays — one for 吉, one for 凶
- **Labels:** Chinese name + subtitle (e.g. `生氣 / 貴人`)

---

## 9. AI Prompt Template

```
You are an Eastern numerology interpreter specializing in the 八宅飛星 digit pair system.

Input string: {inputString}
Expanded digit sequence: {digitSequence}
Processed sequence (after 0/5 rules): {processedSequence}
Selected aspect: {aspect}

Special flags: {specialFlags}
(void-beginning: journey starts from nothing | void-ending: journey ends in void, bad sign)

Pair-by-pair analysis:
{pairBreakdown}
Format: [pair] → [category] [subtitle] | Type: [吉/凶] | Base: [n] | Modifier: [modifier or none] | Final: [n]

Category energy totals:
{categorySummary}

Dominant categories: {dominantCategories}
Auspicious total: {auspiciousTotal} | Inauspicious total: {inauspiciousTotal}

Please provide three sections:

1. JOURNEY READING
Interpret the sequence as a narrative arc. First pair = entry energy. Middle pairs = development. Last pair = outcome. Note any void-beginning or void-ending flags. 2–3 sentences.

2. CUMULATIVE READING
Overall energy assessment. Dominant feeling of this number. Balance of 吉 and 凶. 2–3 sentences.

3. {aspect} INTERPRETATION
{aspectGuidance}
3–4 sentences. Specific and vivid. Reference actual pairs and categories where relevant.

Modifier tone guidance:
- Hidden (0 modifier): energy is latent, subtle, underground — real but not obvious
- Visible (5 modifier): energy is overt, amplified, undeniable
- Double hidden (00): deeply buried, may take long time to surface
- Void ending (trailing 0): dissipation, incompleteness, things don't conclude well
- Void beginning (leading 0): starting from scratch, blank slate, slow activation

Overall tone: Thoughtful and grounded, not alarmist. Acknowledge both 吉 and 凶 honestly.
```

### Aspect Guidance Inserts

| Aspect | Guidance |
|---|---|
| Housing | Describe how this space feels to live in. Atmospheric and experiential. Address harmony, peace, unease, tension, conflict, stagnation, vitality, warmth, creepiness, restlessness as relevant. How would a resident feel day-to-day? |
| Career | Address momentum, obstacles, recognition, benefactor support, competition, visibility, stability vs turbulence. |
| Wealth | Address accumulation patterns, cash flow, income volatility, risk of loss, wealth generation potential. |
| Relationship | Address harmony vs conflict, emotional depth, attraction, stability, communication, power dynamics. |
| Health | Address vitality levels, recovery capacity, chronic patterns, mental and emotional state, energy fluctuations. |

---

## 10. UI Design

### Layout

```
┌─────────────────────────────────────────────┐
│  🔢 八宅飛星 Numerology Reader               │
│  ──────────────────────────────────────────  │
│  [Input field: alphanumeric]                 │
│                                              │
│  Aspect:                                     │
│  [🏠 Housing] [💼 Career] [💰 Wealth]        │
│  [❤️ Relationship] [🏥 Health]               │
│                                              │
│  [Analyze]                                   │
│  ──────────────────────────────────────────  │
│  Expanded: 6 · 2 · 0 · 0 · 2                │
│  Pairs: 62 | 22(hidden)                      │
│  Flags: ⚠️ void-ending                       │
│  ──────────────────────────────────────────  │
│  [Pair Breakdown Table]                      │
│  ──────────────────────────────────────────  │
│              [Radar Chart]                   │
│  ──────────────────────────────────────────  │
│  🔀 Journey Reading                          │
│  ∑ Cumulative Reading                        │
│  ✦ {Aspect} Interpretation                  │
└─────────────────────────────────────────────┘
```

### Pair Breakdown Table Columns

| Pair | Raw | Category | Type | Subtitle | Base | Modifier | Final |
|---|---|---|---|---|---|---|---|
| 62 | 6,2 | 延年 | 吉 | 責任 Longevity | 1 | — | 1.0 |
| 22 | 2,0,0,2 | 伏位 | 吉 | 固執 Stability | 4 | 00→double hidden | 2.0 |

### Color Scheme

| Element | Color |
|---|---|
| 吉 | `#16a34a` green |
| 凶 | `#dc2626` red |
| Modifier 0 (hidden) | Muted grey, dimmed |
| Modifier 5 (visible) | Gold `#d97706` |
| Void flag | Orange `#ea580c` |
| Background | `#0f172a` dark |
| Card/panel | `#1e293b` |
| Text primary | `#f1f5f9` |
| Text secondary | `#94a3b8` |

---

## 11. Task Breakdown for Implementing Agent

### T1 — Data Layer
- [ ] Define all TypeScript types
- [ ] Implement full `LOOKUP` map (64 entries)
- [ ] Implement `expandLetters(input: string): string` — apply alphabet table (A=01...Z=26)
- [ ] Implement `expandFives(digits: string[]): string[]` — leading/trailing 5 extension, recursive
- [ ] Implement `detectFlags(digits: string[]): SpecialFlag[]` — leading/trailing 0 detection
- [ ] Implement `extractPairs(digits: string[]): RawPair[]` — sliding window, collapsing middle 0s/5s into modifier-annotated pairs
- [ ] Implement `lookupPair(pair: RawPair): PairResult` — category + intensity + modifier application
- [ ] Implement `analyzeNumber(input: string): AnalysisResult` — full pipeline

### T2 — Radar Chart
- [ ] Implement `buildRadarData(totals: Record<Category, number>): RadarDataPoint[]`
- [ ] Render dual-overlay `RadarChart` (吉 green / 凶 red)
- [ ] Correct axis order with 吉/凶 facing each other
- [ ] Dynamic max scale

### T3 — AI Integration
- [ ] Implement `buildPrompt(analysis: AnalysisResult, aspect: Aspect): string`
- [ ] Implement `callClaude(prompt: string): Promise<string>` using `claude-sonnet-4-6`
- [ ] Parse AI response into 3 sections
- [ ] Handle loading and error states

### T4 — UI Components
- [ ] `InputPanel`: text input + aspect selector + analyze button
- [ ] `SequenceDisplay`: expanded sequence + pairs + special flags
- [ ] `PairTable`: breakdown with color coding and modifier column
- [ ] `RadarPanel`: dual-color radar chart with legend
- [ ] `InterpretationPanel`: 3-section AI output
- [ ] `LoadingState`: skeleton while API call in progress

### T5 — Edge Cases
- [ ] `505`, `555` → void, no pairs, show empty state
- [ ] Single digit input → no pairs possible, show message
- [ ] All zeros input → void, no energy
- [ ] Very long input (20+ chars) → no truncation, process all
- [ ] Mixed case letters → normalize to uppercase
- [ ] No aspect selected → disable Analyze button
- [ ] Letters E (05), J (10), O (15), T (20), Y (25) → verify special handling

---

## 12. Worked Examples

### Example 1: `620B` (Housing)

```
B = 02
Expansion: 6,2,0,0,2
5-expansion: none
0-detection: middle 00 between 2 and 2
Pairs:
  62 → 延年 (責任) base=1, no modifier, final=1.0
  22 → 伏位 (固執) base=4, double-hidden (00), final=2.0
Flags: none (no leading/trailing 0 after accounting for middle 00)
吉 total: 3.0 | 凶 total: 0
Housing read: Quiet understated stability. Mild longevity energy at entry,
deep but hidden stability at core. Residents feel secure over time but
the space doesn't announce itself. Peaceful, low drama.
```

### Example 2: `101`

```
Digits: 1,0,1
Middle 0 between 1 and 1 → pair: 11 (hidden)
伏位 base=4, hidden modifier, final=3.0
Read: Stability is real but operates below the surface. Not immediately obvious.
```

### Example 3: `151`

```
Digits: 1,5,1
Middle 5 between 1 and 1 → pair: 11 (visible)
伏位 base=4, visible modifier, final=5.0
Read: Stability is overt, amplified, undeniable. Very apparent.
```

### Example 4: `110`

```
Digits: 1,1,0
Trailing 0 detected → flag: void-ending
Pair: 11 → 伏位 base=4, no modifier, final=4.0
Flag: ⚠️ Void ending — journey dissipates into nothing
Read: Strong stability, but ultimately leads to dissolution. Good start, bad ending.
```

### Example 5: `115`

```
Digits: 1,1,5
Trailing 5 → extend last non-5 digit (1) → digits become: 1,1,1
Pairs: 11, 11
Both → 伏位 base=4, final=4.0
Read: Double reinforced stability. Very strong 伏位 energy.
```

### Example 6: `505`

```
Digits: 5,0,5
Leading 5: no non-5 digit to left → void
Trailing 5: no non-5 digit to right → void
Result: collapses to 0 only
No pairs. Flag: complete void — no energy to read.
```

---

*Spec version 1.2 — Ready for implementation*
