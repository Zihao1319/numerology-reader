# Numerology Reading App — Specification v2.0

> Current implementation spec — reflects the live codebase
> Previous versions: v1.1, v1.2, v1.3 in this folder

---

## 1. Overview

A stateless React + TypeScript single-page app that analyzes alphanumeric strings using Eastern numerology (八宅飛星 digit pair system). Users input a number/string, select an aspect, and receive a full energy reading with visual radar chart, score out of 100, and AI-generated interpretation.

**Stack:** React + Recharts + Vercel Edge Function + OpenRouter (Qwen3.7-plus, fallback to Claude Sonnet)

---

## 2. Core Philosophy

> The reading is a **sequential story**. Each pair is a narrative beat. The story is assembled deterministically from structured annotations, then narrated by LLM with rich structured context.

Key principles:
- **凶 ≠ bad.** 凶 categories represent raw talent and intensity, not inherently negative energy.
- **Intensity matters.** PEAK (i4) hits harder than MILD (i1) even within same category.
- **Context determines expression.** 禍害 = disputes OR speaking/sales ability. 絕命 = separation OR bold risk-taker. Read the surrounding pairs.
- **Journey style.** Each number is read as cause → effect, pair by pair.

---

## 3. Alphabet Expansion

| Letter | Value | Digits | Note |
|---|---|---|---|
| A | 01 | 0,1 | Leading 0 — hidden energy |
| B | 02 | 0,2 | Leading 0 — hidden energy |
| C | 03 | 0,3 | Leading 0 |
| D | 04 | 0,4 | Leading 0 |
| E | 05 | 0,5 | Leading 0 then 5 |
| F | 06 | 0,6 | Leading 0 |
| G | 07 | 0,7 | Leading 0 |
| H | 08 | 0,8 | Leading 0 |
| I | 09 | 0,9 | Leading 0 |
| J | 10 | 1,0 | Trailing 0 |
| K | 11 | 1,1 | 伏位 directly |
| L | 12 | 1,2 | 絕命 directly |
| M | 13 | 1,3 | 天醫 directly |
| N | 14 | 1,4 | 生氣 directly |
| O | 15 | 1,5 | 5 extends 1 → 11 |
| P | 16 | 1,6 | 六煞 directly |
| Q | 17 | 1,7 | 禍害 directly |
| R | 18 | 1,8 | 五鬼 directly |
| S | 19 | 1,9 | 延年 directly |
| T | 20 | 2,0 | Trailing 0 |
| U | 21 | 2,1 | 絕命 directly |
| V | 22 | 2,2 | 伏位 directly |
| W | 23 | 2,3 | 禍害 directly |
| X | 24 | 2,4 | 五鬼 directly |
| Y | 25 | 2,5 | 5 extends 2 → 22 |
| Z | 26 | 2,6 | 延年 directly |

---

## 4. 0/5 Tokenizer Rules (Traditional)

Applied left-to-right on digit sequence after letter expansion.

### Rule E — 0+5 or 5+0 together → 伏位
```
05, 50 → 伏位 of next non-0/5 digit
```

### Rule C — Middle 5 bridge (X5Y) → XY pair doubled
```
658 → 68, 68  (天醫 intensity 3, repeated twice)
951 → 91, 91  (延年 intensity 4, repeated twice)
```

### Rule D — Middle 0 hidden (X0Y) → hidden XY pair
```
307 → 37 (絕命 intensity 1, hidden modifier)
109 → 19 (延年 intensity 4, hidden modifier)
```

### Rule A — Adjacent 0 (X0 or 0X) → XX 伏位
```
30 → 33 (伏位 intensity 1)
07 → 77 (伏位 intensity 2)
08 → 88 (伏位 intensity 3)
01 → 11 (伏位 intensity 4)
```

### Rule B — Adjacent 5 (X5 or 5X) → XX 伏位
```
45 → 44 (伏位 intensity 1)
58 → 88 (伏位 intensity 3)
15 → 11 (伏位 intensity 4)
```

### Processing Order
1. Rule E (0+5 combos)
2. Rule C (middle 5 bridge)
3. Rule D (middle 0 hidden)
4. Rules A & B (adjacent 0/5)
5. Direct pairs (no 0/5)

---

## 5. Lookup Table

### 四吉數 Auspicious (運氣 — Luck/Fortune)

| Category | Subtitle | Pairs (intensity 4→1) |
|---|---|---|
| 生氣 | 貴人 Benefactor | 14/41 → 67/76 → 93/39 → 82/28 |
| 天醫 | 財富 Wealth | 13/31 → 68/86 → 49/94 → 72/27 |
| 延年 | 責任 Longevity | 19/91 → 87/78 → 34/43 → 26/62 |
| 伏位 | 固執 Stability | 11/22 → 88/99 → 77/66 → 33/44 |

> 伏位 note: 11/22 share intensity 4 as yin/yang mirrors. Same applies to 88/99, 77/66, 33/44.

### 四凶數 Inauspicious (才華 — Talent/Capability)

| Category | Subtitle | Pairs (intensity 4→1) |
|---|---|---|
| 絕命 | 波動 Volatility | 12/21 → 69/96 → 84/48 → 37/73 |
| 五鬼 | 詭異 Erratic | 18/81 → 79/97 → 42/24 → 36/63 |
| 六煞 | 矛盾 Conflict | 16/61 → 47/74 → 38/83 → 92/29 |
| 禍害 | 衝擊 Impact | 17/71 → 89/98 → 46/64 → 23/32 |

---

## 6. Category Dual-Nature Seeds

Each category has both light and shadow expressions. Context determines which applies.

```
生氣:
  core:   vitality, new beginnings, benefactors, opportunities
  light:  breakthroughs, helpful people arriving, fresh starts
  shadow: restlessness, impulsiveness, inability to settle

天醫:
  core:   wealth, healing, nourishment, wisdom
  light:  financial accumulation, care for others, intelligence
  shadow: naivety, over-giving, being taken advantage of

延年:
  core:   longevity, endurance, leadership, commitment
  light:  sustained effort, authority, long-term results
  shadow: stubbornness, rigidity, controlling tendencies

伏位:
  core:   stability, stillness, hidden potential, waiting
  light:  patient accumulation, one day bursting forth (一鳴驚人)
  shadow: stagnation, passivity, missed opportunities
  elevator: amplifies or deflates preceding energy by intensity

絕命:
  core:   bold decisiveness, high volatility, severance
  light:  daring risk-taker, pioneer, adventurous, loves travel, unsettled spirit
  shadow: impulsive decisions, separation, sudden loss, feast-or-famine

五鬼:
  core:   unconventional intelligence, unpredictability
  light:  creative genius, out-of-box thinker, artistic talent, entertainment star
  shadow: erratic, hidden sabotage, trust issues, instability

六煞:
  core:   interpersonal magnetism, emotional entanglement
  light:  exceptional EQ, charming, strong network, romantic appeal
  shadow: romantic entanglement, affairs, indecision, conflict

禍害:
  core:   verbal power, mouth energy, persuasion
  light:  gifted speaker, natural salesman, convincing negotiator (891 = speaking → results)
  shadow: disputes, arguments, verbal conflict, losing face
```

---

## 7. 伏位 Elevator Rules

### Standalone (position 0, no preceding pair)
→ Original meaning: stability, waiting, hidden potential
→ Score: 50 + (intensity × 5) = 55/60/65/70

### Elevator (position > 0, has preceding pair)
→ Amplifies or deflates the preceding pair's energy and score

| Intensity | Direction | Effect |
|---|---|---|
| 4 (11/22) | Amplify strong | prevScore + (100−prevScore) × 0.3 |
| 3 (88/99) | Amplify moderate | prevScore + (100−prevScore) × 0.2 |
| 2 (77/66) | Amplify slight | prevScore + (100−prevScore) × 0.1 |
| 1 (33/44) | Deflate | prevScore + (50−prevScore) × 0.3 |

---

## 8. Two-Pass Annotation

### Pass 1 — Structural roles
- `narrativeRole`: opening / development / closing / solo
- `transitionType`: opening / same-category / ausp-to-ausp / ausp-to-inaup / inaup-to-ausp / inaup-to-inaup / fuwei-amplify / fuwei-deflate / fuwei-standalone
- `elevatorEffect`: direction + strength + precedingCategory

### Pass 2 — Sequential scoring
Computed sequentially so each score can reference the previous pair's already-computed score.

```typescript
// Pair score table
吉: { 4: 100, 3: 85, 2: 70, 1: 60 }
凶: { 4: 0,   3: 15, 2: 30, 1: 40 }
伏位: see elevator rules above
unknown: 50 (neutral)
```

---

## 9. Scoring Formula

```
finalScore = clamp(average(all pair scores), 0, 100)
```

No flag penalties currently (void beginning/ending deferred to future version).

### Score Bands
| Score | Band |
|---|---|
| 85–100 | ✨ Excellent |
| 70–84 | 👍 Good |
| 50–69 | 🔶 Mixed |
| 30–49 | ⚠️ Challenging |
| 0–29 | 🔴 Unfavourable |

---

## 10. Sequence Brief (LLM Input)

For each pair, the brief includes:
- `originalDigits → resolvedPair | category type | intensity/4 (label) | score`
- Category seed meaning
- Narrative role (OPENING / DEVELOPMENT / CLOSING)
- Modifier if present (hidden, visible)
- Transition type with plain description
- Elevator direction if 伏位

---

## 11. AI Prompts (Bilingual)

### Base Prompt (Journey + Cumulative)
- Instructions in English
- Category meanings in Chinese (triggers Qwen's Chinese knowledge base)
- Dual-nature 吉/凶 guidance included
- Key principle: 凶星代表才華與能量，不一定是壞事
- Output in English
- Style: direct, analytical, name pairs explicitly, no metaphors

### Aspect Prompt (1 API call per aspect switch)
- Same bilingual structure
- Aspect-specific guidance
- Reminds LLM to consider light/shadow based on context

### Two-Call Strategy
- Call 1: Base prompt → Journey Reading + Cumulative Reading (stable, not re-called on aspect switch)
- Call 2: Aspect prompt → Aspect Interpretation (re-called on each aspect change)

---

## 12. API / Model

**Primary:** OpenRouter → `qwen/qwen3.7-plus`
- $0.32/M input, $1.28/M output
- ~10x cheaper than Claude Sonnet
- Better Chinese metaphysical knowledge
- 25s timeout in Edge Function

**Fallback:** Anthropic → `claude-sonnet-4-6`
- Triggers if OpenRouter fails or times out
- 20s timeout

**Provider badge shown in UI header** after each reading.

---

## 13. UI Features

### Read Mode
- Alphanumeric input
- 5 aspect buttons (Housing / Career / Wealth / Relationship / Health)
- Sequence display (expanded digits → pairs with modifiers)
- Score circle with band + 吉/凶 energy bar
- Pair breakdown table (role, transition, intensity, score per pair)
- Radar chart (8-axis, dual color 吉 green / 凶 red)
- Interpretation panel (Journey / Cumulative / Aspect sections)
- Provider badge in header (🟣 Qwen / 🟡 Claude)

### Compare Mode
- Textarea input (one number per line)
- Optional label format: `Label: Number`
- Instant ranking by score (pure JS, zero API calls)
- Score bar per result
- Pair chips with elevator indicators (↑↓)
- Summary: Best / Worst / Average

---

## 14. Deployment

**Vercel:**
- Frontend: Vite + React
- Backend: `/api/chat.js` Node.js function (maxDuration: 35s)
- Env vars: `OPENROUTER_API_KEY`, `ANTHROPIC_API_KEY`

**Vercel.json:**
```json
{
  "functions": { "api/chat.js": { "maxDuration": 35 } },
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 15. Known Limitations / Future Work

- [ ] Void beginning/ending flag penalties (deferred)
- [ ] 0/5 rules partially simplified — full traditional rules researched but not fully implemented
- [ ] Dual-nature seeds not yet in CATEGORY_SEEDS constant (currently only in prompt)
- [ ] No user history or saved readings
- [ ] Mobile layout not optimized
- [ ] Qwen3.7-plus cold start latency (~10-25s) — may need faster model

---

*Spec v2.0 — Current implementation as of June 2026*
