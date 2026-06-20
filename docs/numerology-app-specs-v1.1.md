# Numerology Reading App — Specification v1.1

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
- **FR1.3** Expand letters to digit strings using A=1, B=2 ... Z=26 mapping. Each letter expands to its full numeric string (A→"1", J→"10", Z→"26")
- **FR1.4** Flatten into individual digit character sequence (e.g. `498J` → `4`,`9`,`8`,`1`,`0`)
- **FR1.5** Generate sliding window consecutive pairs from the digit sequence (e.g. `4`,`9`,`8`,`1`,`0` → `49`, `98`, `81`, `10`)
- **FR1.6** Display the expanded digit sequence and all pairs to the user before the analysis

### FR2 — Pair Lookup
- **FR2.1** All pairs are **reversible** — `12` and `21` map to the same category and intensity
- **FR2.2** Map each pair to one of 8 categories (see Lookup Table)
- **FR2.3** Assign base intensity (1–4) based on position within category (first listed = highest = 4)
- **FR2.4** Unrecognized pairs (no table match) are flagged as `"unknown"` and displayed with a note

### FR3 — Modifiers (Digits 0 and 5)
- **FR3.1** Digit `0` = invisible/latent → **reduce** pair intensity by 1 (floor at 0.5 to show energy still exists but hidden)
- **FR3.2** Digit `5` = visible/manifest → **increase** pair intensity by 1 (ceiling at 5)
- **FR3.3** Modifier applies when `0` or `5` appears **adjacent** to either digit of the pair in the original digit sequence
- **FR3.4** Edge case — if both `0` and `5` are adjacent to a pair: `5` (visible) takes precedence over `0` (invisible)
- **FR3.5** Modified final intensity is used for radar chart weighting and narrative tone

### FR4 — Aspects
- **FR4.1** User selects exactly one aspect per reading
- **FR4.2** Five aspects available: Housing, Career, Wealth, Relationship, Health
- **FR4.3** Selected aspect is passed to AI as context for interpretation

### FR5 — Output
- **FR5.1** Pair breakdown table (per pair: digits, category, 吉/凶 type, base intensity, modifier, final intensity, one-line description)
- **FR5.2** Radar/star chart (8-axis, intensity-weighted, colored by 吉/凶)
- **FR5.3** Journey narrative (sequential reading: entry → development → outcome)
- **FR5.4** Cumulative reading (dominant energies, 吉 vs 凶 balance, net assessment)
- **FR5.5** Aspect-specific AI interpretation (context-aware, vivid, grounded tone)

### FR6 — AI Interpretation
- **FR6.1** Call Claude Sonnet 4.6 API (`claude-sonnet-4-6`) with full pair analysis + aspect context
- **FR6.2** Housing aspect → atmospheric/experiential language (harmony, unease, stagnation, vitality, creepiness, peace, conflict)
- **FR6.3** Career/Wealth/Health/Relationship → outcome-focused language
- **FR6.4** AI receives in prompt: input string, expanded digit sequence, all pairs with categories + intensities + modifiers, selected aspect, 吉/凶 balance summary
- **FR6.5** Stateless — no conversation history, single prompt per analysis

---

## 3. Data Model

### 3.1 Types

```typescript
type Category =
  | "生氣" | "天醫" | "延年" | "伏位"   // 吉 Auspicious
  | "絕命" | "五鬼" | "六煞" | "禍害"   // 凶 Inauspicious

type CategoryType = "吉" | "凶"

type Modifier = "invisible" | "visible" | null

type Aspect = "Housing" | "Career" | "Wealth" | "Relationship" | "Health"

type PairResult = {
  pair: string                    // e.g. "49"
  digits: [string, string]        // e.g. ["4", "9"]
  category: Category | "unknown"
  categoryType: CategoryType | null
  baseIntensity: 1 | 2 | 3 | 4   // null if unknown
  modifier: Modifier
  modifierSource: string | null   // which digit triggered the modifier, e.g. "0 after pair"
  finalIntensity: number          // 0.5–5, same as base if no modifier
  description: string             // one-line energy description
}

type AnalysisResult = {
  input: string
  digitSequence: string[]
  pairs: PairResult[]
  categoryTotals: Record<Category, number>   // sum of finalIntensity per category
  auspiciousTotal: number
  inauspiciousTotal: number
  dominantCategories: Category[]
}

type RadarDataPoint = {
  category: string    // display label e.g. "生氣\n貴人"
  value: number       // sum of finalIntensity for this category
  type: CategoryType
}
```

---

## 4. Lookup Table

### 4.1 Eight Categories

All pairs are reversible. Intensity rank: position 1 = highest (4), position 4 = lowest (1).

#### 四吉數 Auspicious

| Category | Subtitle | Pairs by Descending Intensity |
|---|---|---|
| 生氣 | 貴人 Benefactor | 14/41 (4) → 67/76 (3) → 93/39 (2) → 82/28 (1) |
| 天醫 | 財富 Wealth | 13/31 (4) → 68/86 (3) → 49/94 (2) → 72/27 (1) |
| 延年 | 責任 Longevity | 19/91 (4) → 87/78 (3) → 34/43 (2) → 26/62 (1) |
| 伏位 | 固執 Stability | 11/22 (4) → 88/99 (3) → 77/66 (2) → 33/44 (1) |

> Note on 伏位: pairs like 11/22 are treated as reversals of each other — same category, same intensity rank.

#### 四凶數 Inauspicious

| Category | Subtitle | Pairs by Descending Intensity |
|---|---|---|
| 絕命 | 波動 Volatility | 12/21 (4) → 69/96 (3) → 84/48 (2) → 37/73 (1) |
| 五鬼 | 詭異 Erratic | 18/81 (4) → 79/97 (3) → 42/24 (2) → 36/63 (1) |
| 六煞 | 矛盾 Conflict | 16/61 (4) → 47/74 (3) → 38/83 (2) → 92/29 (1) |
| 禍害 | 衝擊 Impact | 17/71 (4) → 89/98 (3) → 46/64 (2) → 23/32 (1) |

### 4.2 TypeScript Lookup Map

```typescript
const LOOKUP: Record<string, { category: Category; intensity: 1 | 2 | 3 | 4 }> = {
  // 生氣 (Benefactor)
  "14": { category: "生氣", intensity: 4 }, "41": { category: "生氣", intensity: 4 },
  "67": { category: "生氣", intensity: 3 }, "76": { category: "生氣", intensity: 3 },
  "93": { category: "生氣", intensity: 2 }, "39": { category: "生氣", intensity: 2 },
  "82": { category: "生氣", intensity: 1 }, "28": { category: "生氣", intensity: 1 },
  // 天醫 (Wealth)
  "13": { category: "天醫", intensity: 4 }, "31": { category: "天醫", intensity: 4 },
  "68": { category: "天醫", intensity: 3 }, "86": { category: "天醫", intensity: 3 },
  "49": { category: "天醫", intensity: 2 }, "94": { category: "天醫", intensity: 2 },
  "72": { category: "天醫", intensity: 1 }, "27": { category: "天醫", intensity: 1 },
  // 延年 (Longevity)
  "19": { category: "延年", intensity: 4 }, "91": { category: "延年", intensity: 4 },
  "87": { category: "延年", intensity: 3 }, "78": { category: "延年", intensity: 3 },
  "34": { category: "延年", intensity: 2 }, "43": { category: "延年", intensity: 2 },
  "26": { category: "延年", intensity: 1 }, "62": { category: "延年", intensity: 1 },
  // 伏位 (Stability)
  "11": { category: "伏位", intensity: 4 }, "22": { category: "伏位", intensity: 4 },
  "88": { category: "伏位", intensity: 3 }, "99": { category: "伏位", intensity: 3 },
  "77": { category: "伏位", intensity: 2 }, "66": { category: "伏位", intensity: 2 },
  "33": { category: "伏位", intensity: 1 }, "44": { category: "伏位", intensity: 1 },
  // 絕命 (Volatility)
  "12": { category: "絕命", intensity: 4 }, "21": { category: "絕命", intensity: 4 },
  "69": { category: "絕命", intensity: 3 }, "96": { category: "絕命", intensity: 3 },
  "84": { category: "絕命", intensity: 2 }, "48": { category: "絕命", intensity: 2 },
  "37": { category: "絕命", intensity: 1 }, "73": { category: "絕命", intensity: 1 },
  // 五鬼 (Erratic)
  "18": { category: "五鬼", intensity: 4 }, "81": { category: "五鬼", intensity: 4 },
  "79": { category: "五鬼", intensity: 3 }, "97": { category: "五鬼", intensity: 3 },
  "42": { category: "五鬼", intensity: 2 }, "24": { category: "五鬼", intensity: 2 },
  "36": { category: "五鬼", intensity: 1 }, "63": { category: "五鬼", intensity: 1 },
  // 六煞 (Conflict)
  "16": { category: "六煞", intensity: 4 }, "61": { category: "六煞", intensity: 4 },
  "47": { category: "六煞", intensity: 3 }, "74": { category: "六煞", intensity: 3 },
  "38": { category: "六煞", intensity: 2 }, "83": { category: "六煞", intensity: 2 },
  "92": { category: "六煞", intensity: 1 }, "29": { category: "六煞", intensity: 1 },
  // 禍害 (Impact)
  "17": { category: "禍害", intensity: 4 }, "71": { category: "禍害", intensity: 4 },
  "89": { category: "禍害", intensity: 3 }, "98": { category: "禍害", intensity: 3 },
  "46": { category: "禍害", intensity: 2 }, "64": { category: "禍害", intensity: 2 },
  "23": { category: "禍害", intensity: 1 }, "32": { category: "禍害", intensity: 1 },
}
```

---

## 5. Processing Pipeline

### 5.1 Input Expansion

```
Input: "498J"
Step 1 — Strip non-alphanumeric: "498J"
Step 2 — Expand letters (J=10): "498" + "10" = "49810"
Step 3 — Split to digit array: ["4","9","8","1","0"]
Step 4 — Sliding window pairs: ["49","98","81","10"]
```

### 5.2 Modifier Detection

For each pair at position `i` and `i+1` in digit sequence:
- Check digit at position `i-1` (before pair) and `i+2` (after pair)
- If any adjacent digit is `0` → modifier = `"invisible"`, finalIntensity = max(baseIntensity - 1, 0.5)
- If any adjacent digit is `5` → modifier = `"visible"`, finalIntensity = min(baseIntensity + 1, 5)
- If both `0` and `5` adjacent → `"visible"` wins, apply +1
- If no adjacent 0 or 5 → modifier = null, finalIntensity = baseIntensity

### 5.3 Category Totals for Radar

```typescript
// Sum finalIntensity per category across all pairs
categoryTotals["生氣"] = sum of finalIntensity where category === "生氣"
// ... repeat for all 8 categories
```

---

## 6. Modifier Rules Summary

| Digit | Meaning | Narrative | Intensity Effect |
|---|---|---|---|
| `0` | Invisible / latent | Energy exists but operates below the surface, not apparent | −1 (floor 0.5) |
| `5` | Visible / manifest | Energy is overt, amplified, clearly felt | +1 (ceiling 5) |

---

## 7. Radar Chart Specification

- **Shape:** Octagon — 8 axes evenly spaced at 45°
- **Library:** Recharts `RadarChart`
- **Axis order (clockwise from top):** 生氣, 天醫, 延年, 伏位, 禍害, 六煞, 五鬼, 絕命
  - 吉 and 凶 categories face each other across the chart to show tension
- **Value per axis:** Sum of `finalIntensity` across all pairs in that category
- **Max scale:** 20 (adjust dynamically if any axis exceeds 20)
- **Colors:**
  - 吉 axes and fill area: green (`#16a34a`)
  - 凶 axes and fill area: red (`#dc2626`)
  - Consider rendering two separate radar overlays (one 吉, one 凶) for color distinction
- **Labels:** Show Chinese name + subtitle below (e.g. `生氣 / 貴人`)
- **Dot:** Show value dot on each axis

---

## 8. AI Prompt Template

```
You are an Eastern numerology interpreter specializing in the 八宅飛星 digit pair system.

Input string: {inputString}
Expanded digit sequence: {digitSequence}
Selected aspect: {aspect}

Pair-by-pair analysis:
{pairBreakdown}
(Format per pair: [pair] → [category] [subtitle] | Type: [吉/凶] | Base intensity: [n] | Modifier: [modifier or none] | Final intensity: [n])

Category energy totals:
{categorySummary}
(Format: [category]: [total finalIntensity])

Dominant categories: {dominantCategories}
Auspicious total: {auspiciousTotal} | Inauspicious total: {inauspiciousTotal}

Please provide three sections:

1. JOURNEY READING
Interpret the sequence as a narrative arc. First pair = entry/opening energy. Middle pairs = development. Last pair = outcome/closing energy. 2–3 sentences. Written as a story arc.

2. CUMULATIVE READING
Overall energy assessment. What is the dominant feeling of this number? Balance of 吉 and 凶. Net energy in 2–3 sentences.

3. {aspect} INTERPRETATION
{aspectGuidance}
3–4 sentences. Specific and vivid. Do not be generic.

Tone guidelines:
- Thoughtful and grounded, not alarmist or overly superstitious
- Acknowledge both 吉 and 凶 energies honestly
- High intensity = stronger expression of the category's nature
- Modified by 0 (invisible): energy is latent, subtle, underground — not absent
- Modified by 5 (visible): energy is overt, amplified, undeniable
```

### Aspect Guidance Inserts

| Aspect | Guidance |
|---|---|
| Housing | Describe how this space feels to live in. Atmospheric and experiential language. Address: harmony, peace, unease, tension, conflict, stagnation, vitality, warmth, creepiness, restlessness as relevant. How would a resident feel day-to-day? |
| Career | Address: momentum, obstacles, recognition, benefactor support, competition, visibility, stability vs turbulence in professional life. |
| Wealth | Address: accumulation patterns, cash flow, volatility of income/investments, risk of loss, wealth generation potential, spending tendencies. |
| Relationship | Address: harmony vs conflict, emotional depth, attraction, stability, communication patterns, power dynamics. |
| Health | Address: vitality levels, recovery capacity, chronic patterns, mental and emotional state, energy fluctuations. |

---

## 9. UI Design

### 9.1 Layout Structure

```
┌─────────────────────────────────────────────┐
│  🔢 八宅飛星 Numerology Reader               │
│  ──────────────────────────────────────────  │
│  [Input field: alphanumeric placeholder]     │
│                                              │
│  Aspect:                                     │
│  [🏠 Housing] [💼 Career] [💰 Wealth]        │
│  [❤️ Relationship] [🏥 Health]               │
│                                              │
│  [Analyze]                                   │
│  ──────────────────────────────────────────  │
│  Expanded sequence: 4 · 9 · 8 · 1 · 0       │
│  Pairs: 49 | 98 | 81 | 10                   │
│  ──────────────────────────────────────────  │
│  [Pair Breakdown Table]                      │
│  ──────────────────────────────────────────  │
│              [Radar Chart]                   │
│  ──────────────────────────────────────────  │
│  Journey Reading                             │
│  ──────────────────────────────────────────  │
│  Cumulative Reading                          │
│  ──────────────────────────────────────────  │
│  ✦ Housing Interpretation                   │
└─────────────────────────────────────────────┘
```

### 9.2 Pair Breakdown Table

Columns: Pair | Category | Type | Subtitle | Base | Modifier | Final

Example row:
```
49 | 天醫 | 吉 | 財富 Wealth | 2 | — | 2.0
81 | 五鬼 | 凶 | 詭異 Erratic | 4 | — | 4.0
10 | — | — | — | — | 0 → invisible | —
```

- 吉 rows: green tint
- 凶 rows: red tint
- Unknown pairs: grey, flagged with note
- Modifier column: shows which digit triggered it and direction (↓ invisible / ↑ visible)

### 9.3 Color Scheme

| Element | Color |
|---|---|
| 吉 category | `#16a34a` (green) |
| 凶 category | `#dc2626` (red) |
| Modifier 0 (invisible) | Muted grey, dimmed opacity |
| Modifier 5 (visible) | Gold / amber `#d97706` |
| Background | Dark theme: `#0f172a` |
| Card/panel | `#1e293b` |
| Text primary | `#f1f5f9` |
| Text secondary | `#94a3b8` |

### 9.4 Loading State

Show a spinner / skeleton on the AI interpretation panel while API call is in progress. Pair breakdown table and radar chart should render **immediately** (no API dependency). AI interpretation renders after API response.

---

## 10. Task Breakdown for Implementing Agent

### T1 — Data Layer
- [ ] Define all TypeScript types (`PairResult`, `AnalysisResult`, `RadarDataPoint`, etc.)
- [ ] Implement full `LOOKUP` map (all 64 entries)
- [ ] Implement `expandInput(input: string): string[]` — alphanumeric to digit array
- [ ] Implement `generatePairs(digits: string[]): string[]` — sliding window of 2
- [ ] Implement `detectModifier(digits: string[], pairIndex: number): Modifier` — check adjacents for 0 or 5
- [ ] Implement `lookupPair(pair: string, digits: string[], pairIndex: number): PairResult`
- [ ] Implement `analyzeNumber(input: string): AnalysisResult` — full pipeline

### T2 — Radar Chart
- [ ] Install/import Recharts
- [ ] Implement `buildRadarData(totals: Record<Category, number>): RadarDataPoint[]`
- [ ] Define correct axis order (clockwise, 吉/凶 facing each other)
- [ ] Render `RadarChart` with 8 axes, dual color (吉 green / 凶 red)
- [ ] Scale max value dynamically

### T3 — AI Integration
- [ ] Implement `buildPrompt(analysis: AnalysisResult, aspect: Aspect): string`
- [ ] Implement `callClaude(prompt: string): Promise<string>` using `claude-sonnet-4-6`
- [ ] Parse AI response into 3 sections (Journey / Cumulative / Aspect)
- [ ] Handle loading and error states

### T4 — UI Components
- [ ] `InputPanel`: text input + aspect selector buttons + analyze button
- [ ] `SequenceDisplay`: show expanded digit sequence and pairs
- [ ] `PairTable`: pair breakdown with color coding
- [ ] `RadarPanel`: radar chart with legend
- [ ] `InterpretationPanel`: 3-section AI output (Journey / Cumulative / Aspect)
- [ ] `LoadingState`: skeleton for interpretation panel

### T5 — Edge Cases
- [ ] Unknown pairs — display as `—` with "no match" note
- [ ] Single digit input — show "minimum 2 digits needed for pairs"
- [ ] All-zero or all-five input — handle gracefully
- [ ] Very long input (20+ chars) — no truncation, process all pairs
- [ ] Mixed case letters — normalize to uppercase before mapping
- [ ] No aspect selected — disable Analyze button, show prompt to select

---

## 11. Non-Requirements (Out of Scope)

- No backend or database
- No user accounts or authentication
- No history or persistence
- No multi-aspect simultaneous reading
- No mobile-specific layout (responsive is nice-to-have)
- No sharing or export functionality

---

## 12. Example Walkthrough

**Input:** `498J` | **Aspect:** Housing

```
Expansion: J=10 → digits: 4, 9, 8, 1, 0
Pairs:
  49 → 天醫 (財富), base=2, modifier=none, final=2.0
  98 → 禍害 (衝擊), base=3, modifier=none, final=3.0
  81 → 五鬼 (詭異), base=4, modifier=none, final=4.0
  10 → unknown (0 present — invisible modifier noted)

Category totals:
  天醫: 2.0
  禍害: 3.0
  五鬼: 4.0

吉 total: 2.0 | 凶 total: 7.0

Expected housing interpretation:
- Starts with mild wealth/nourishing energy (天醫, moderate)
- Disrupted by strong impact/shock energy (禍害, high)
- Dominated by intense erratic/unsettling energy (五鬼, highest)
- The trailing 0 adds invisible/latent quality to the tail
- Atmospheric reading: space may feel unsettling, strange occurrences possible,
  residents may sense unease especially over time
```

---

*Spec version 1.1 — Ready for implementation*
