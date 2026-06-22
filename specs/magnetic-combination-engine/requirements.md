# Requirements — Magnetic Combination Engine (磁場化解/制化 + Richer Seeds)

## 1. Overview

The current engine reads each digit pair as an isolated 磁場 with a pairwise transition
to its neighbour. Traditional 數字能量學 has a layer above that: **named multi-pair
combinations** that either *remedy* (制化) inauspicious fields or *amplify* auspicious ones,
plus far richer dual-nature meanings per category than the single seed string we ship today.

This feature adds two tightly-coupled capabilities:

1. **Combination detection** — a post-annotation pass that scans the pair sequence for the
   canonical named combinations (生天延, 五鬼制化, 絕命破解, etc.) and reports which
   remedies / curses / power-stacks are present.
2. **Richer category seeds** — replace each flat `CATEGORY_SEEDS` string with a structured
   `{ core, light, shadow, domains }` object, so both the deterministic engine and the LLM
   brief carry the light/shadow duality and concrete life-domain hits.

Out of scope (deferred to separate specs): 五行 five-element flow, 三才 trigram structure,
position weighting, 八十一數理 cross-check.

## 2. Source Rules (from research, 2026-06-21)

Combination rules confirmed from Chinese sources (see specs/CHANGELOG and the original
research notes):

- **生天延 (生氣→天醫→延年, consecutive, order locked)** — master protective sequence;
  制化五鬼 and neutralises bad 流年.
- **五鬼制化** — remedied by `生氣+天醫+延年` consecutive (order fixed) OR `延年+伏位`.
- **絕命破解** — broken by presence of 天醫 adjacent.
- **六煞壓制** — suppressed by 延年 adjacent.
- **禍害化解** — dissolved by 生氣 adjacent.
- **伏位啟動** — 伏位 only "activates" its stored potential when followed/preceded by
  生氣/天醫/延年; otherwise it is dead 蓄勢 (stagnation).
- **吉星疊加 (power stack)** — 生氣+延年+天醫 in any adjacency = 最佳組合 (strongest
  auspicious compounding).
- **連續磁場 (consecutive same field)** — N≥2 identical categories in a row amplify that
  field's nature (e.g. 連續大五鬼). Severity scales with run length and intensity.

> Authoritative ordering note: "順序不能改變" — 生天延 must appear in that literal order to
> count as the remedy. A reversed or scrambled run does NOT qualify.

## 3. User Stories & Acceptance Criteria (EARS)

### US-1 — Detect named remedy combinations
As a reader, I want the engine to flag when a protective combination is present, so the
interpretation can say "this number carries the 生天延 remedy" instead of reading pairs blindly.

- **AC-1.1** WHEN the pair sequence contains 生氣, 天醫, 延年 as three consecutive pairs in
  that exact order, THE SYSTEM SHALL emit a combination of type `生天延` with
  `remedies: ["五鬼"]` and the matched pair index range.
- **AC-1.2** WHEN the sequence contains a 五鬼 pair AND a qualifying remedy (生天延 run OR an
  adjacent 延年+伏位), THE SYSTEM SHALL mark each affected 五鬼 pair with `remediedBy` naming
  the remedy; otherwise 五鬼 SHALL be marked `unremedied: true`.
- **AC-1.3** WHEN a 絕命 pair is adjacent to a 天醫 pair, THE SYSTEM SHALL mark that 絕命 as
  `remediedBy: "天醫"`.
- **AC-1.4** WHEN a 六煞 pair is adjacent to a 延年 pair, THE SYSTEM SHALL mark that 六煞 as
  `remediedBy: "延年"`.
- **AC-1.5** WHEN a 禍害 pair is adjacent to a 生氣 pair, THE SYSTEM SHALL mark that 禍害 as
  `remediedBy: "生氣"`.

### US-2 — Detect power stacks and dead 伏位
- **AC-2.1** WHEN 生氣, 天醫, and 延年 all appear among adjacent pairs (any order, contiguous
  run), THE SYSTEM SHALL emit a `吉星疊加` combination.
- **AC-2.2** WHEN a 伏位 pair has no 生氣/天醫/延年 neighbour, THE SYSTEM SHALL mark it
  `activated: false`; otherwise `activated: true` with the activating category.

### US-3 — Detect consecutive-field amplification
- **AC-3.1** WHEN N≥2 pairs of the same category appear consecutively, THE SYSTEM SHALL emit a
  `連續` combination with the category, run length, and an `amplified: true` flag.

### US-4 — Richer category seeds
- **AC-4.1** THE SYSTEM SHALL expose, for each of the 8 categories, a structured seed object
  with `core`, `light`, `shadow`, and `domains` fields (all non-empty strings/arrays).
- **AC-4.2** WHEN building the LLM brief, THE SYSTEM SHALL include the light/shadow duality
  and domain hits for each pair's category (not just the old single seed string).

### US-5 — Surface combinations in UI and prompt
- **AC-5.1** THE SYSTEM SHALL render a "Combinations" panel listing every detected combination
  (type, remedied/unremedied status, affected pairs) when at least one exists.
- **AC-5.2** THE SYSTEM SHALL inject a `COMBINATIONS` block into both the base and aspect LLM
  prompts summarising detected remedies/curses/stacks, so the narration references them.

### US-6 — Score adjustment from combinations (DECISION 2026-06-21: enabled)
As a reader, I want detected remedies and curses to move the numeric score, so the 0-100 number
reflects the combination layer, not just isolated pairs.

- **AC-6.1** THE SYSTEM SHALL compute an `adjustedPairScore` per pair from its `pairScore` plus
  bounded combination modifiers, and recompute `finalScore` from `adjustedPairScore`.
- **AC-6.2** THE raw `pairScore` SHALL be retained unchanged on each pair (for transparency /
  comparison); only `adjustedPairScore` and `finalScore` reflect combinations.
- **AC-6.3** WHEN a 凶 pair is remedied, its `adjustedPairScore` SHALL move toward neutral
  (softened); WHEN a 凶 pair is unremedied or part of a 連續 凶 run, it SHALL move lower (full
  force / amplified); WHEN a 吉 pair is in a 連續 吉 run or a 吉星疊加, it SHALL move higher.
- **AC-6.4** All modifiers SHALL be bounded so `adjustedPairScore` and `finalScore` stay within
  [0,100]; exact magnitudes per design §9.
- **AC-6.5** WHEN a number produces zero combinations, `adjustedPairScore === pairScore` for
  every pair and `finalScore` SHALL equal the pre-feature baseline (no drift).

### US-7 — Backward compatibility
- **AC-7.1** WHEN a number produces zero combinations, THE SYSTEM SHALL render no Combinations
  panel and inject no COMBINATIONS prompt block.
- **AC-7.2** Existing fields other than score (pairs, categories, radar totals) SHALL be
  unchanged.

## 4. Non-Functional

- Pure deterministic JS, runs client-side in `analyzeNumber`, zero API calls.
- No new dependencies.
- Detection must be O(n) over pairs.

## 5. Open Questions

- Q1: ~~Should remedies adjust the numeric score?~~ **RESOLVED 2026-06-21 — YES** (US-6).
  Score bands may need re-tuning after adjustments land — verify in audit (design §9).
- Q2: Adjacency for AC-1.3/1.4/1.5 — **RESOLVED 2026-06-21 — immediate neighbour** (left or
  right). Sequence-level reserved for 生天延 only.
- Q3: Score modifier strengths (design §9) — **RESOLVED 2026-06-21 — accept v1 defaults**
  (0.40/0.20/0.15/0.30/+3); audit T10 re-tunes against real distributions.
