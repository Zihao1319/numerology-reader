import { useState } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

// ─── TYPES & CONSTANTS ────────────────────────────────────────────────────────

const AUSPICIOUS = ["生氣", "天醫", "延年", "伏位"];
const INAUSPICIOUS = ["絕命", "五鬼", "六煞", "禍害"];

const CATEGORY_META = {
  "生氣": { subtitle: "貴人", subtitleEn: "Benefactor", type: "吉" },
  "天醫": { subtitle: "財富", subtitleEn: "Wealth", type: "吉" },
  "延年": { subtitle: "責任", subtitleEn: "Longevity", type: "吉" },
  "伏位": { subtitle: "固執", subtitleEn: "Stability", type: "吉" },
  "絕命": { subtitle: "波動", subtitleEn: "Volatility", type: "凶" },
  "五鬼": { subtitle: "詭異", subtitleEn: "Erratic", type: "凶" },
  "六煞": { subtitle: "矛盾", subtitleEn: "Conflict", type: "凶" },
  "禍害": { subtitle: "衝擊", subtitleEn: "Impact", type: "凶" },
};

const ASPECTS = [
  { key: "Housing", emoji: "🏠", label: "Housing" },
  { key: "Career", emoji: "💼", label: "Career" },
  { key: "Wealth", emoji: "💰", label: "Wealth" },
  { key: "Relationship", emoji: "❤️", label: "Relationship" },
  { key: "Health", emoji: "🏥", label: "Health" },
];

const ASPECT_GUIDANCE = {
  Housing: "Describe how this space feels to live in. Use atmospheric and experiential language. Address harmony, peace, unease, conflict, stagnation, vitality, warmth, or creepiness as relevant. How would a resident feel day-to-day?",
  Career: "Address momentum, obstacles, recognition, benefactor support, competition, visibility, and stability vs turbulence in professional life.",
  Wealth: "Address accumulation patterns, cash flow, income volatility, risk of loss, and wealth generation potential.",
  Relationship: "Address harmony vs conflict, emotional depth, attraction, stability, communication patterns, and power dynamics.",
  Health: "Address vitality levels, recovery capacity, chronic patterns, mental and emotional state, and energy fluctuations.",
};

const BAND_COLORS = {
  Excellent: "#16a34a", Good: "#0d9488", Mixed: "#d97706",
  Challenging: "#ea580c", Unfavourable: "#dc2626", Void: "#475569",
};
const BAND_LABELS = {
  Excellent: "✨ Excellent", Good: "👍 Good", Mixed: "🔶 Mixed",
  Challenging: "⚠️ Challenging", Unfavourable: "🔴 Unfavourable", Void: "∅ Void",
};
const SECTION_ICONS = {
  "JOURNEY READING": "🔀", "CUMULATIVE READING": "∑",
  "HOUSING INTERPRETATION": "🏠", "CAREER INTERPRETATION": "💼",
  "WEALTH INTERPRETATION": "💰", "RELATIONSHIP INTERPRETATION": "❤️",
  "HEALTH INTERPRETATION": "🏥",
};

// ─── LOOKUP TABLE ─────────────────────────────────────────────────────────────

const LOOKUP = {
  "14": { category: "生氣", intensity: 4 }, "41": { category: "生氣", intensity: 4 },
  "67": { category: "生氣", intensity: 3 }, "76": { category: "生氣", intensity: 3 },
  "93": { category: "生氣", intensity: 2 }, "39": { category: "生氣", intensity: 2 },
  "82": { category: "生氣", intensity: 1 }, "28": { category: "生氣", intensity: 1 },
  "13": { category: "天醫", intensity: 4 }, "31": { category: "天醫", intensity: 4 },
  "68": { category: "天醫", intensity: 3 }, "86": { category: "天醫", intensity: 3 },
  "49": { category: "天醫", intensity: 2 }, "94": { category: "天醫", intensity: 2 },
  "72": { category: "天醫", intensity: 1 }, "27": { category: "天醫", intensity: 1 },
  "19": { category: "延年", intensity: 4 }, "91": { category: "延年", intensity: 4 },
  "87": { category: "延年", intensity: 3 }, "78": { category: "延年", intensity: 3 },
  "34": { category: "延年", intensity: 2 }, "43": { category: "延年", intensity: 2 },
  "26": { category: "延年", intensity: 1 }, "62": { category: "延年", intensity: 1 },
  "11": { category: "伏位", intensity: 4 }, "22": { category: "伏位", intensity: 4 },
  "88": { category: "伏位", intensity: 3 }, "99": { category: "伏位", intensity: 3 },
  "77": { category: "伏位", intensity: 2 }, "66": { category: "伏位", intensity: 2 },
  "33": { category: "伏位", intensity: 1 }, "44": { category: "伏位", intensity: 1 },
  "12": { category: "絕命", intensity: 4 }, "21": { category: "絕命", intensity: 4 },
  "69": { category: "絕命", intensity: 3 }, "96": { category: "絕命", intensity: 3 },
  "84": { category: "絕命", intensity: 2 }, "48": { category: "絕命", intensity: 2 },
  "37": { category: "絕命", intensity: 1 }, "73": { category: "絕命", intensity: 1 },
  "18": { category: "五鬼", intensity: 4 }, "81": { category: "五鬼", intensity: 4 },
  "79": { category: "五鬼", intensity: 3 }, "97": { category: "五鬼", intensity: 3 },
  "42": { category: "五鬼", intensity: 2 }, "24": { category: "五鬼", intensity: 2 },
  "36": { category: "五鬼", intensity: 1 }, "63": { category: "五鬼", intensity: 1 },
  "16": { category: "六煞", intensity: 4 }, "61": { category: "六煞", intensity: 4 },
  "47": { category: "六煞", intensity: 3 }, "74": { category: "六煞", intensity: 3 },
  "38": { category: "六煞", intensity: 2 }, "83": { category: "六煞", intensity: 2 },
  "92": { category: "六煞", intensity: 1 }, "29": { category: "六煞", intensity: 1 },
  "17": { category: "禍害", intensity: 4 }, "71": { category: "禍害", intensity: 4 },
  "89": { category: "禍害", intensity: 3 }, "98": { category: "禍害", intensity: 3 },
  "46": { category: "禍害", intensity: 2 }, "64": { category: "禍害", intensity: 2 },
  "23": { category: "禍害", intensity: 1 }, "32": { category: "禍害", intensity: 1 },
};

const PAIR_DESCRIPTIONS = {
  "14": "Strong benefactor — powerful people come to your aid",
  "41": "Strong benefactor — powerful people come to your aid",
  "67": "Good benefactor — helpful connections appear",
  "76": "Good benefactor — helpful connections appear",
  "93": "Moderate benefactor — support available",
  "39": "Moderate benefactor — support available",
  "82": "Mild benefactor — occasional helpful encounters",
  "28": "Mild benefactor — occasional helpful encounters",
  "13": "Peak wealth — strongest nourishing and healing force",
  "31": "Peak wealth — strongest nourishing and healing force",
  "68": "Strong wealth — good financial flow",
  "86": "Strong wealth — good financial flow",
  "49": "Moderate wealth — steady accumulation",
  "94": "Moderate wealth — steady accumulation",
  "72": "Mild wealth — gentle prosperity",
  "27": "Mild wealth — gentle prosperity",
  "19": "Strong longevity — lasting results and responsibility",
  "91": "Strong longevity — lasting results and responsibility",
  "87": "Good longevity — sustained effort pays off",
  "78": "Good longevity — sustained effort pays off",
  "34": "Moderate longevity — steady progress",
  "43": "Moderate longevity — steady progress",
  "26": "Mild longevity — slow but enduring",
  "62": "Mild longevity — slow but enduring",
  "11": "Peak stability — intense self-reinforcing energy",
  "22": "Peak stability — deep mirror energy, unwavering",
  "88": "Strong stability — solid and grounded",
  "99": "Strong stability — solid and grounded",
  "77": "Moderate stability — things hold steady",
  "66": "Moderate stability — things hold steady",
  "33": "Mild stability — low-key stillness",
  "44": "Mild stability — low-key stillness",
  "12": "Intense volatility — high turbulence, rapid change",
  "21": "Intense volatility — high turbulence, rapid change",
  "69": "Strong volatility — significant disruption",
  "96": "Strong volatility — significant disruption",
  "84": "Moderate volatility — some instability",
  "48": "Moderate volatility — some instability",
  "37": "Mild volatility — minor fluctuations, low-level busyness",
  "73": "Mild volatility — minor fluctuations, low-level busyness",
  "18": "Intense erratic — strange occurrences, unpredictability",
  "81": "Intense erratic — strange occurrences, unpredictability",
  "79": "Strong erratic — unsettling undercurrents",
  "97": "Strong erratic — unsettling undercurrents",
  "42": "Moderate erratic — occasional oddities",
  "24": "Moderate erratic — occasional oddities",
  "36": "Mild erratic — subtle strangeness",
  "63": "Mild erratic — subtle strangeness",
  "16": "Intense conflict — strong contradictions and disputes",
  "61": "Intense conflict — strong contradictions and disputes",
  "47": "Strong conflict — friction and disagreements",
  "74": "Strong conflict — friction and disagreements",
  "38": "Moderate conflict — occasional tension",
  "83": "Moderate conflict — occasional tension",
  "92": "Mild conflict — minor misalignments",
  "29": "Mild conflict — minor misalignments",
  "17": "Intense impact — sudden shocks and disruptions",
  "71": "Intense impact — sudden shocks and disruptions",
  "89": "Strong impact — significant setbacks",
  "98": "Strong impact — significant setbacks",
  "46": "Moderate impact — occasional disruption",
  "64": "Moderate impact — occasional disruption",
  "23": "Mild impact — minor setbacks",
  "32": "Mild impact — minor setbacks",
};

// ─── ENGINE v2 ────────────────────────────────────────────────────────────────

const CATEGORY_SEEDS = {
  "生氣": "vitality, new beginnings, benefactors, opportunities, breakthroughs",
  "天醫": "wealth, healing, nourishment, wisdom, care",
  "延年": "longevity, endurance, commitment, responsibility, leadership",
  "伏位": "stability, stillness, hidden potential, waiting — elevator: amplifies or deflates preceding energy by intensity",
  "絕命": "separation, severance, endings, volatility, disruption",
  "五鬼": "hidden forces, unpredictability, strangeness, sabotage, erratic energy",
  "六煞": "entanglement, conflict, romance complications, interpersonal friction",
  "禍害": "sudden shocks, verbal disputes, unexpected loss, arguments",
};

const INTENSITY_LABELS = { 4: "PEAK (strongest)", 3: "STRONG", 2: "MODERATE", 1: "MILD (weakest)" };

// Step 1: letter expansion
function expandLetters(input) {
  return input.toUpperCase().replace(/[A-Z]/g, ch => {
    const val = ch.charCodeAt(0) - 64;
    return val < 10 ? `0${val}` : `${val}`;
  });
}

// Step 2: tokenizer — traditional 0/5 rules
function tokenize(digits) {
  const tokens = [];
  let i = 0;
  while (i < digits.length - 1) {
    const a = digits[i], b = digits[i + 1];
    const c = i + 2 < digits.length ? digits[i + 2] : null;

    // Rule E: 0+5 or 5+0 → 伏位 of next non-0/5 digit
    if ((a === "0" && b === "5") || (a === "5" && b === "0")) {
      const next = digits.slice(i + 2).find(d => d !== "0" && d !== "5");
      const fuwei = next ? next + next : "11";
      const entry = LOOKUP[fuwei] || { category: "伏位", intensity: 4 };
      tokens.push({ resolvedPair: fuwei, originalDigits: [a, b], rule: "zero-five-fuwei", modifier: "fuwei", isDoubled: false, category: entry.category, intensity: entry.intensity });
      i += 2; continue;
    }

    // Rule C: middle 5 bridge X5Y → XY doubled
    if (b === "5" && c && a !== "0" && a !== "5" && c !== "0" && c !== "5") {
      const pair = a + c;
      const entry = LOOKUP[pair];
      if (entry) {
        tokens.push({ resolvedPair: pair, originalDigits: [a, b, c], rule: "middle-5-bridge", modifier: "visible", isDoubled: true, category: entry.category, intensity: entry.intensity });
        tokens.push({ resolvedPair: pair, originalDigits: [a, b, c], rule: "middle-5-bridge-echo", modifier: "visible", isDoubled: true, category: entry.category, intensity: entry.intensity });
        i += 2; continue;
      }
    }

    // Rule D: middle 0 X0Y → hidden XY
    if (b === "0" && c && a !== "0" && a !== "5" && c !== "0" && c !== "5") {
      const pair = a + c;
      const entry = LOOKUP[pair];
      if (entry) {
        tokens.push({ resolvedPair: pair, originalDigits: [a, b, c], rule: "middle-0-hidden", modifier: "hidden", isDoubled: false, category: entry.category, intensity: entry.intensity });
        i += 2; continue;
      }
    }

    // Rule A: 0X → XX fuwei
    if (a === "0" && b !== "0" && b !== "5") {
      const fuwei = b + b;
      const entry = LOOKUP[fuwei] || { category: "伏位", intensity: 2 };
      tokens.push({ resolvedPair: fuwei, originalDigits: [a, b], rule: "adjacent-0", modifier: "fuwei", isDoubled: false, category: entry.category, intensity: entry.intensity });
      i += 1; continue;
    }
    if (b === "0" && a !== "0" && a !== "5") {
      const fuwei = a + a;
      const entry = LOOKUP[fuwei] || { category: "伏位", intensity: 2 };
      tokens.push({ resolvedPair: fuwei, originalDigits: [a, b], rule: "adjacent-0", modifier: "fuwei", isDoubled: false, category: entry.category, intensity: entry.intensity });
      i += 2; continue;
    }

    // Rule B: 5X → XX fuwei
    if (a === "5" && b !== "0" && b !== "5") {
      const fuwei = b + b;
      const entry = LOOKUP[fuwei] || { category: "伏位", intensity: 2 };
      tokens.push({ resolvedPair: fuwei, originalDigits: [a, b], rule: "adjacent-5", modifier: "fuwei", isDoubled: false, category: entry.category, intensity: entry.intensity });
      i += 1; continue;
    }
    if (b === "5" && a !== "0" && a !== "5") {
      const fuwei = a + a;
      const entry = LOOKUP[fuwei] || { category: "伏位", intensity: 2 };
      tokens.push({ resolvedPair: fuwei, originalDigits: [a, b], rule: "adjacent-5", modifier: "fuwei", isDoubled: false, category: entry.category, intensity: entry.intensity });
      i += 2; continue;
    }

    // Direct pair
    if (a !== "0" && a !== "5" && b !== "0" && b !== "5") {
      const pair = a + b;
      const entry = LOOKUP[pair];
      tokens.push({ resolvedPair: pair, originalDigits: [a, b], rule: "direct", modifier: null, isDoubled: false, category: entry?.category || "unknown", intensity: entry?.intensity || null });
    }
    i += 1;
  }
  return tokens;
}

// Step 3: two-pass annotation
function annotatePairs(tokens) {
  const total = tokens.length;

  // Pass 1: structural roles and transitions
  const annotated = tokens.map((token, i) => {
    const prev = i > 0 ? tokens[i - 1] : null;
    const next = i < total - 1 ? tokens[i + 1] : null;
    const isFuwei = token.category === "伏位";

    let narrativeRole = total === 1 ? "solo" : i === 0 ? "opening" : i === total - 1 ? "closing" : "development";

    let transitionType = "opening";
    if (prev) {
      if (isFuwei) transitionType = token.intensity >= 2 ? "fuwei-amplify" : "fuwei-deflate";
      else if (token.category === prev.category) transitionType = "same-category";
      else if (AUSPICIOUS.includes(token.category) && AUSPICIOUS.includes(prev.category)) transitionType = "ausp-to-ausp";
      else if (AUSPICIOUS.includes(token.category) && INAUSPICIOUS.includes(prev.category)) transitionType = "inaup-to-ausp";
      else if (INAUSPICIOUS.includes(token.category) && AUSPICIOUS.includes(prev.category)) transitionType = "ausp-to-inaup";
      else if (INAUSPICIOUS.includes(token.category) && INAUSPICIOUS.includes(prev.category)) transitionType = "inaup-to-inaup";
    } else if (isFuwei) transitionType = "fuwei-standalone";

    const elevatorEffect = (isFuwei && prev && prev.category !== "unknown") ? {
      direction: token.intensity >= 2 ? "amplify" : "deflate",
      strength: token.intensity,
      precedingCategory: prev.category,
    } : null;

    return { ...token, position: i, totalPairs: total, narrativeRole, transitionType, elevatorEffect, pairScore: null, precedingCategory: prev?.category || null, followingCategory: next?.category || null };
  });

  // Pass 2: compute scores sequentially
  for (let i = 0; i < annotated.length; i++) {
    annotated[i].pairScore = computePairScore(annotated[i], i > 0 ? annotated[i - 1] : null);
  }

  return annotated;
}

function computePairScore(token, prev) {
  const { category, intensity } = token;
  if (category === "unknown" || intensity === null) return 50;
  if (category === "伏位") {
    if (!prev || prev.category === "unknown") return 50 + intensity * 5; // standalone: 55/60/65/70
    const prevScore = prev.pairScore ?? 50;
    if (intensity >= 2) {
      const boost = intensity === 4 ? 0.3 : intensity === 3 ? 0.2 : 0.1;
      return prevScore > 50
        ? Math.min(100, Math.round(prevScore + (100 - prevScore) * boost))
        : Math.max(0, Math.round(prevScore - prevScore * boost));
    }
    return Math.round(prevScore + (50 - prevScore) * 0.3); // deflate toward neutral
  }
  const isAusp = AUSPICIOUS.includes(category);
  return isAusp ? { 4: 100, 3: 85, 2: 70, 1: 60 }[intensity] : { 4: 0, 3: 15, 2: 30, 1: 40 }[intensity];
}

function getScoreBand(score) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Mixed";
  if (score >= 30) return "Challenging";
  return "Unfavourable";
}

// Step 4: build sequence brief for LLM
function buildBrief(pairs) {
  return pairs.map((p, i) => {
    const iLabel = p.intensity ? INTENSITY_LABELS[p.intensity] : "unknown";
    const type = p.category !== "unknown" ? (AUSPICIOUS.includes(p.category) ? "吉" : "凶") : "";
    const seed = p.category !== "unknown" ? CATEGORY_SEEDS[p.category] : "unknown pair";
    const lines = [
      `[${i + 1}] ${p.originalDigits.join("")}→${p.resolvedPair} | ${p.category} ${type} | intensity ${p.intensity}/4 (${iLabel}) | score ${p.pairScore}`,
      `    Meaning: ${seed}`,
      `    Role: ${p.narrativeRole.toUpperCase()}`,
    ];
    if (p.modifier && p.modifier !== "fuwei") lines.push(`    Modifier: ${p.modifier}`);
    if (p.transitionType === "fuwei-amplify" && p.elevatorEffect) {
      const w = p.elevatorEffect.strength === 4 ? "powerfully" : p.elevatorEffect.strength === 3 ? "strongly" : "slightly";
      lines.push(`    Elevator: ${w} AMPLIFIES preceding ${p.elevatorEffect.precedingCategory} → score pushed higher`);
    } else if (p.transitionType === "fuwei-deflate" && p.elevatorEffect) {
      lines.push(`    Elevator: DEFLATES preceding ${p.elevatorEffect.precedingCategory} → momentum fades toward neutral`);
    } else if (p.transitionType === "fuwei-standalone") {
      lines.push(`    Elevator: standalone — stable waiting energy, hidden potential`);
    } else if (p.transitionType === "same-category") {
      lines.push(`    Transition: SAME CATEGORY — ${p.category} reinforces and intensifies`);
    } else if (p.transitionType === "ausp-to-ausp") {
      lines.push(`    Transition: 吉→吉 — positive energy compounds`);
    } else if (p.transitionType === "ausp-to-inaup") {
      lines.push(`    Transition: 吉→凶 — REVERSAL — what was good turns difficult`);
    } else if (p.transitionType === "inaup-to-ausp") {
      lines.push(`    Transition: 凶→吉 — RECOVERY — difficulty gives way to improvement`);
    } else if (p.transitionType === "inaup-to-inaup") {
      lines.push(`    Transition: 凶→凶 — negative energy COMPOUNDS`);
    }
    return lines.join("\n");
  }).join("\n\n");
}

// Step 5: full analysis
function analyzeNumber(input) {
  const stripped = input.replace(/[^a-zA-Z0-9]/g, "");
  const expanded = expandLetters(stripped);
  const rawDigits = expanded.split("");
  const tokens = tokenize(rawDigits);
  const pairs = annotatePairs(tokens);

  const categoryTotals = Object.fromEntries([...AUSPICIOUS, ...INAUSPICIOUS].map(c => [c, 0]));
  let auspiciousTotal = 0, inauspiciousTotal = 0;
  pairs.forEach(p => {
    if (p.category !== "unknown" && p.intensity) {
      categoryTotals[p.category] += p.intensity;
      if (AUSPICIOUS.includes(p.category)) auspiciousTotal += p.intensity;
      else inauspiciousTotal += p.intensity;
    }
  });

  const avgScore = pairs.length > 0 ? pairs.reduce((s, p) => s + (p.pairScore ?? 50), 0) / pairs.length : 50;
  const finalScore = Math.min(100, Math.max(0, Math.round(avgScore)));

  return {
    input, rawDigits, pairs,
    categoryTotals, auspiciousTotal, inauspiciousTotal,
    averagePairScore: Math.round(avgScore), finalScore,
    scoreBand: pairs.length === 0 ? "Void" : getScoreBand(finalScore),
    brief: buildBrief(pairs),
  };
}

// ─── CLAUDE API ───────────────────────────────────────────────────────────────

function buildBasePrompt(analysis) {
  return `You are a 八宅飛星數字磁場 numerology reader with deep knowledge of Chinese metaphysics.

Number: ${analysis.input}
Score: ${analysis.finalScore}/100 (${analysis.scoreBand})
吉: ${analysis.auspiciousTotal} | 凶: ${analysis.inauspiciousTotal}

八大磁場含義 (Eight Category Meanings):
生氣 — 貴人、新機遇、突破、活力、新開始
天醫 — 財富、療癒、滋養、智慧、財運亨通
延年 — 長壽、耐力、領導力、承擔責任、持久成果
伏位 — 穩定、蓄勢待發、隱藏潛力、等待時機、一鳴驚人 (elevator: amplifies/deflates preceding energy)
絕命 — 決斷力、冒險精神、大起大落、敢拼敢闖、喜歡旅行或不安定 / also: 分離、突變、波動
五鬼 — 鬼才、創意天賦、非常規思維、演藝體育宗教界天才 / also: 詭異、不穩定、暗中破壞
六煞 — 人際磁場強、情商高、八面玲瓏、桃花旺、社交能力強 / also: 感情糾纏、矛盾衝突
禍害 — 口才好、說服力強、天生業務員、談判高手、891=說話能力帶來成果 / also: 口舌是非、爭執

重要原則: 凶星代表才華與能量，不一定是壞事。讀數字要看組合與context，不能單純論吉凶。

SEQUENCE:
${analysis.brief}

Write exactly two sections, headers on their own line, 1–2 sentences each.
Output in English. Be direct and analytical — name each pair explicitly, state what it means plainly, connect cause-effect.
No metaphors. No poetic language. Intensity matters — PEAK is stronger than MILD.

JOURNEY READING
Read sequentially. First pair = opening energy. Each pair = what follows. Last pair = outcome.
Use plain cause-effect: "which leads to", "followed by", "ending with".

CUMULATIVE READING
One sentence: overall energy. One sentence: what this number fundamentally represents.`;
}

function buildAspectPrompt(analysis, aspect) {
  return `You are a 八宅飛星數字磁場 numerology reader with deep knowledge of Chinese metaphysics.

Number: ${analysis.input} | Score: ${analysis.finalScore}/100 (${analysis.scoreBand})

八大磁場含義:
生氣 — 貴人、新機遇、突破、活力
天醫 — 財富、療癒、滋養、智慧
延年 — 長壽、耐力、領導力、責任
伏位 — 穩定、蓄勢待發、電梯效應（放大或縮小前一個磁場）
絕命 — 決斷、冒險、大起大落 / 分離、波動、喜歡旅行不安定
五鬼 — 鬼才、創意 / 詭異、不穩定
六煞 — 人際磁場、情商、桃花 / 糾纏、矛盾
禍害 — 口才、說服力、業務能力 / 口舌是非、爭執

凶星 = 才華能量，不一定壞。看組合和context決定正面還是負面表達。

SEQUENCE:
${analysis.brief}

Write exactly one section, header on its own line, 2–3 sentences max.
Output in English. Name each pair explicitly. Direct and analytical, no metaphors.

${aspect.toUpperCase()} INTERPRETATION
${ASPECT_GUIDANCE[aspect]}
Read as a journey — what does this sequence mean for ${aspect} specifically?
For 凶 categories: consider both light side (talent/capability) and shadow side based on context.
Intensity matters — PEAK hits harder than MILD.`;
}

async function callClaude(prompt) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const raw = await response.text();
  let data;
  try { data = JSON.parse(raw); }
  catch { throw new Error(`Non-JSON response: ${raw.slice(0, 80)}`); }
  if (!response.ok) throw new Error(data.error || `API error ${response.status}`);
  return { text: data.text ?? "", provider: data.provider ?? "unknown" };
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function Chip({ children, color }) {
  return (
    <div style={{ padding: "2px 8px", borderRadius: 4, border: `1px solid ${color}`, color, fontSize: 12, fontFamily: "monospace", letterSpacing: "0.05em" }}>
      {children}
    </div>
  );
}

function InputPanel({ input, aspect, onInputChange, onAspectChange, onAnalyze, loading, hasAnalysis }) {
  const canAnalyze = input.trim().length > 0 && !loading;
  return (
    <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b", marginBottom: 8 }}>
          Enter Number or Alphanumeric
        </label>
        <input
          type="text"
          value={input}
          onChange={e => onInputChange(e.target.value)}
          placeholder="e.g. 91234567, 620B, 498J, 131..."
          style={{
            width: "100%", boxSizing: "border-box",
            background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
            padding: "12px 16px", fontSize: 20, letterSpacing: "0.1em",
            color: "#f1f5f9", outline: "none", fontFamily: "monospace",
          }}
          onKeyDown={e => e.key === "Enter" && canAnalyze && onAnalyze()}
        />
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b", marginBottom: 10 }}>
          Aspect {hasAnalysis && <span style={{ color: "#475569", textTransform: "none", letterSpacing: 0 }}>— click to switch</span>}
        </label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {ASPECTS.map(a => (
            <button key={a.key} onClick={() => onAspectChange(a.key)} style={{
              padding: "8px 16px", borderRadius: 8, border: "1px solid",
              borderColor: aspect === a.key ? "#f59e0b" : "#334155",
              background: aspect === a.key ? "rgba(245,158,11,0.15)" : "transparent",
              color: aspect === a.key ? "#f59e0b" : "#94a3b8",
              fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            }}>
              <span>{a.emoji}</span><span>{a.label}</span>
            </button>
          ))}
        </div>
      </div>
      <button onClick={onAnalyze} disabled={!canAnalyze} style={{
        width: "100%", padding: "13px 0", borderRadius: 8, border: "none",
        background: canAnalyze ? "linear-gradient(135deg, #f59e0b, #d97706)" : "#1e293b",
        color: canAnalyze ? "#0a0f1e" : "#475569",
        fontSize: 14, fontWeight: 700, letterSpacing: "0.08em",
        textTransform: "uppercase", cursor: canAnalyze ? "pointer" : "not-allowed",
      }}>
        {loading ? "Reading Energy..." : "Analyze"}
      </button>
    </div>
  );
}

function SequenceDisplay({ analysis }) {
  return (
    <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b", marginBottom: 14 }}>
        Sequence Analysis
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 80, fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0 }}>Expanded</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {analysis.rawDigits.map((d, i) => (
              <Chip key={i} color={d === "0" ? "#475569" : d === "5" ? "#d97706" : "#94a3b8"}>{d}</Chip>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 80, fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0 }}>Pairs</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            {analysis.pairs.length === 0
              ? <span style={{ color: "#475569", fontSize: 13 }}>No pairs</span>
              : analysis.pairs.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Chip color={AUSPICIOUS.includes(p.category) ? "#16a34a" : INAUSPICIOUS.includes(p.category) ? "#dc2626" : "#475569"}>
                    {p.originalDigits.join("")}→{p.resolvedPair}
                  </Chip>
                  {p.modifier === "hidden" && <span style={{ fontSize: 10, color: "#475569" }}>◎</span>}
                  {p.modifier === "visible" && <span style={{ fontSize: 10, color: "#d97706" }}>✦</span>}
                  {p.transitionType === "fuwei-amplify" && <span style={{ fontSize: 10, color: "#16a34a" }}>↑</span>}
                  {p.transitionType === "fuwei-deflate" && <span style={{ fontSize: 10, color: "#94a3b8" }}>↓</span>}
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreDisplay({ analysis }) {
  const color = BAND_COLORS[analysis.scoreBand] || "#475569";
  const total = analysis.auspiciousTotal + analysis.inauspiciousTotal;
  const auspPct = total > 0 ? (analysis.auspiciousTotal / total) * 100 : 50;

  return (
    <div style={{
      background: "#0f172a", border: `1px solid ${color}40`, borderRadius: 12, padding: 24,
      display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, alignItems: "center",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 100, height: 100, borderRadius: "50%", border: `3px solid ${color}`,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: `${color}10`,
        }}>
          <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>{analysis.finalScore}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>/ 100</div>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color, fontWeight: 600 }}>{BAND_LABELS[analysis.scoreBand]}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 6 }}>
            <span>吉 Auspicious ({analysis.auspiciousTotal})</span>
            <span>凶 Inauspicious ({analysis.inauspiciousTotal})</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "#1e293b", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg, #16a34a ${auspPct}%, #dc2626 ${auspPct}%)` }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, fontSize: 13 }}>
          <div><span style={{ color: "#64748b" }}>Pair avg: </span><span style={{ color: "#e2e8f0", fontWeight: 600 }}>{analysis.averagePairScore}</span></div>
          <div><span style={{ color: "#64748b" }}>Pairs: </span><span style={{ color: "#e2e8f0", fontWeight: 600 }}>{analysis.pairs.length}</span></div>
        </div>
      </div>
    </div>
  );
}

function PairTable({ pairs }) {
  if (pairs.length === 0) return (
    <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b", marginBottom: 14 }}>Pair Breakdown</div>
      <div style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No pairs to display</div>
    </div>
  );

  return (
    <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b", marginBottom: 14 }}>Pair Breakdown</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {pairs.map((p, i) => {
          const isAusp = AUSPICIOUS.includes(p.category);
          const isInaup = INAUSPICIOUS.includes(p.category);
          const color = isAusp ? "#16a34a" : isInaup ? "#dc2626" : "#475569";
          const scoreColor = p.pairScore >= 75 ? "#16a34a" : p.pairScore >= 50 ? "#d97706" : "#dc2626";
          const meta = p.category !== "unknown" ? CATEGORY_META[p.category] : null;

          // transition label
          const transLabels = {
            "same-category": "↺ reinforced",
            "ausp-to-ausp": "吉→吉 compounds",
            "ausp-to-inaup": "吉→凶 reversal",
            "inaup-to-ausp": "凶→吉 recovery",
            "inaup-to-inaup": "凶→凶 compounds",
            "fuwei-amplify": `↑ elevator (${p.elevatorEffect?.strength === 4 ? "strong" : p.elevatorEffect?.strength === 3 ? "moderate" : "mild"})`,
            "fuwei-deflate": "↓ elevator (deflate)",
            "fuwei-standalone": "◼ stable base",
          };
          const transLabel = transLabels[p.transitionType] || "";

          return (
            <div key={i} style={{ background: `${color}08`, border: `1px solid ${color}25`, borderRadius: 8, padding: "10px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "monospace", fontSize: 13, color: "#94a3b8" }}>{p.originalDigits.join("")}</span>
                  <span style={{ color: "#334155" }}>→</span>
                  <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color }}>{p.resolvedPair}</span>
                  {meta && <>
                    <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 4, background: `${color}20`, color }}>{isAusp ? "吉" : "凶"}</span>
                    <span style={{ fontSize: 13, color: "#e2e8f0" }}>{p.category}</span>
                    <span style={{ fontSize: 11, color: "#64748b" }}>{meta.subtitle}/{meta.subtitleEn}</span>
                  </>}
                  {p.category === "unknown" && <span style={{ fontSize: 12, color: "#475569" }}>unknown</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {p.intensity && <span style={{ fontSize: 11, color: "#64748b" }}>i{p.intensity}</span>}
                  <span style={{ fontSize: 16, fontWeight: 700, color: scoreColor, fontFamily: "monospace" }}>{p.pairScore}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#64748b" }}>
                <span>{p.narrativeRole}</span>
                {transLabel && <span style={{ color: isAusp ? "#16a34a" : isInaup ? "#dc2626" : "#94a3b8" }}>{transLabel}</span>}
                {p.modifier && p.modifier !== "fuwei" && <span style={{ color: p.modifier === "hidden" ? "#475569" : "#d97706" }}>· {p.modifier}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const RADAR_AXIS_ORDER = ["生氣", "天醫", "延年", "伏位", "禍害", "六煞", "五鬼", "絕命"];

function RadarPanel({ categoryTotals }) {
  const hasData = Object.values(categoryTotals).some(v => v > 0);
  const combinedData = RADAR_AXIS_ORDER.map(cat => ({
    category: `${cat} ${CATEGORY_META[cat].subtitle}`,
    ausp: AUSPICIOUS.includes(cat) ? (categoryTotals[cat] || 0) : 0,
    inausp: INAUSPICIOUS.includes(cat) ? (categoryTotals[cat] || 0) : 0,
  }));

  return (
    <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b", marginBottom: 14 }}>Energy Radar</div>
      {!hasData ? (
        <div style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: "40px 0" }}>No energy data</div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={combinedData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="category" tick={{ fill: "#64748b", fontSize: 9 }} />
              <Radar name="吉" dataKey="ausp" stroke="#16a34a" fill="#16a34a" fillOpacity={0.25} strokeWidth={2} />
              <Radar name="凶" dataKey="inausp" stroke="#dc2626" fill="#dc2626" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 8 }}>
            {[["#16a34a", "吉 Auspicious"], ["#dc2626", "凶 Inauspicious"]].map(([color, label]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color }}>
                <div style={{ width: 12, height: 3, background: color, borderRadius: 2 }} />
                {label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function parseInterpretation(text) {
  const headers = ["JOURNEY READING", "CUMULATIVE READING", "HOUSING INTERPRETATION", "CAREER INTERPRETATION", "WEALTH INTERPRETATION", "RELATIONSHIP INTERPRETATION", "HEALTH INTERPRETATION"];
  const sections = [];
  const upperText = text.toUpperCase();

  for (const header of headers) {
    const idx = upperText.indexOf(header);
    if (idx === -1) continue;
    const after = text.slice(idx + header.length).replace(/^[\s:]+/, "");
    let end = after.length;
    for (const h2 of headers) {
      const next = after.toUpperCase().indexOf(h2);
      if (next !== -1 && next < end) end = next;
    }
    sections.push({ title: header, content: after.slice(0, end).trim() });
  }
  return sections;
}

function InterpretationPanel({ interpretation, loadingBase, loadingAspect, error, aspect }) {
  if (!interpretation && !loadingBase && !loadingAspect && !error) return null;

  const sections = interpretation ? parseInterpretation(interpretation) : [];

  return (
    <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 24 }}>
      <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b", marginBottom: 20 }}>Interpretation</div>

      {/* Render existing sections first */}
      {sections.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: (loadingAspect) ? 24 : 0 }}>
          {sections.map((s, i) => (
            <div key={i}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 16 }}>{SECTION_ICONS[s.title] ?? "✦"}</span>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94a3b8" }}>{s.title}</span>
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.8, color: "#cbd5e1", paddingLeft: 24 }}>{s.content}</div>
            </div>
          ))}
        </div>
      )}

      {/* Aspect loading skeleton */}
      {loadingAspect && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ height: 12, width: 160, background: "#1e293b", borderRadius: 4, marginBottom: 6 }} />
          {[100, 85, 65].map((w, j) => (
            <div key={j} style={{ height: 10, width: `${w}%`, background: "#1e293b", borderRadius: 4 }} />
          ))}
        </div>
      )}

      {error && <div style={{ color: "#dc2626", fontSize: 13, marginTop: 12 }}>{error}</div>}
    </div>
  );
}

// ─── COMPARE MODE ─────────────────────────────────────────────────────────────

function ComparePanel() {
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState([]);
  const [ranked, setRanked] = useState(false);

  const handleRank = () => {
    const lines = inputText.split("\n").map(l => l.trim()).filter(Boolean);
    const analyzed = lines.map(line => {
      // support "label: number" format e.g. "Block 620B: 620B"
      const colonIdx = line.indexOf(":");
      const label = colonIdx > -1 ? line.slice(0, colonIdx).trim() : null;
      const num = colonIdx > -1 ? line.slice(colonIdx + 1).trim() : line;
      const result = analyzeNumber(num);
      return { label: label || num, input: num, ...result };
    });
    analyzed.sort((a, b) => b.finalScore - a.finalScore);
    setResults(analyzed);
    setRanked(true);
  };

  const MEDAL = ["🥇", "🥈", "🥉"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Input */}
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 24 }}>
        <label style={{ display: "block", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b", marginBottom: 8 }}>
          Enter numbers to compare — one per line
        </label>
        <div style={{ fontSize: 11, color: "#475569", marginBottom: 12 }}>
          Tip: use "Label: Number" format e.g. "Block A: 620B" for clearer results
        </div>
        <textarea
          value={inputText}
          onChange={e => { setInputText(e.target.value); setRanked(false); }}
          placeholder={"91234567\n98765432\nBlock A: 620B\nMy number: 1312"}
          rows={6}
          style={{
            width: "100%", boxSizing: "border-box",
            background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
            padding: "12px 16px", fontSize: 14, color: "#f1f5f9",
            outline: "none", fontFamily: "monospace", resize: "vertical",
            letterSpacing: "0.05em", lineHeight: 1.8,
          }}
        />
        <button
          onClick={handleRank}
          disabled={!inputText.trim()}
          style={{
            marginTop: 12, width: "100%", padding: "13px 0", borderRadius: 8, border: "none",
            background: inputText.trim() ? "linear-gradient(135deg, #f59e0b, #d97706)" : "#1e293b",
            color: inputText.trim() ? "#0a0f1e" : "#475569",
            fontSize: 14, fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase", cursor: inputText.trim() ? "pointer" : "not-allowed",
          }}
        >
          Rank by Score
        </button>
      </div>

      {/* Results */}
      {ranked && results.length > 0 && (
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b", marginBottom: 16 }}>
            Rankings — {results.length} numbers
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {results.map((r, i) => {
              const color = BAND_COLORS[r.scoreBand] || "#475569";
              const topCategories = Object.entries(r.categoryTotals)
                .filter(([, v]) => v > 0)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([k]) => k);
              const barWidth = r.finalScore;

              return (
                <div key={i} style={{
                  background: "#0a0f1e", border: `1px solid ${color}30`,
                  borderRadius: 10, padding: "14px 16px",
                  position: "relative", overflow: "hidden",
                }}>
                  {/* Score bar background */}
                  <div style={{
                    position: "absolute", left: 0, top: 0, bottom: 0,
                    width: `${barWidth}%`, background: `${color}10`,
                    transition: "width 0.5s ease",
                  }} />

                  <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Rank */}
                    <div style={{ fontSize: 20, width: 32, textAlign: "center", flexShrink: 0 }}>
                      {MEDAL[i] || <span style={{ fontSize: 13, color: "#475569", fontWeight: 700 }}>#{i + 1}</span>}
                    </div>

                    {/* Label + pairs */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 4, fontFamily: "monospace" }}>
                        {r.label}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {r.pairs.map((p, j) => {
                          const isAusp = AUSPICIOUS.includes(p.category);
                          const isInaup = INAUSPICIOUS.includes(p.category);
                          const pColor = isAusp ? "#16a34a" : isInaup ? "#dc2626" : "#475569";
                          return (
                            <span key={j} style={{
                              fontSize: 11, padding: "1px 6px", borderRadius: 4,
                              border: `1px solid ${pColor}40`, color: pColor,
                              fontFamily: "monospace",
                            }}>
                              {p.resolvedPair}
                              {p.transitionType === "fuwei-amplify" && "↑"}
                              {p.transitionType === "fuwei-deflate" && "↓"}
                            </span>
                          );
                        })}
                      </div>
                      {topCategories.length > 0 && (
                        <div style={{ marginTop: 4, fontSize: 11, color: "#64748b" }}>
                          {topCategories.join(" · ")}
                        </div>
                      )}
                    </div>

                    {/* Score */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: "monospace", lineHeight: 1 }}>
                        {r.finalScore}
                      </div>
                      <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{r.scoreBand}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary stats */}
          <div style={{ marginTop: 16, padding: "12px 16px", background: "#1e293b", borderRadius: 8, display: "flex", gap: 24, fontSize: 12, color: "#64748b" }}>
            <span>Best: <strong style={{ color: "#f1f5f9" }}>{results[0]?.label}</strong> ({results[0]?.finalScore})</span>
            <span>Worst: <strong style={{ color: "#f1f5f9" }}>{results[results.length - 1]?.label}</strong> ({results[results.length - 1]?.finalScore})</span>
            <span>Avg: <strong style={{ color: "#f1f5f9" }}>{Math.round(results.reduce((s, r) => s + r.finalScore, 0) / results.length)}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [mode, setMode] = useState("read");
  const [apiKey, setApiKey] = useState("");
  const [keySet, setKeySet] = useState(false);
  const [input, setInput] = useState("");
  const [aspect, setAspect] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [baseInterpretation, setBaseInterpretation] = useState(null);
  const [aspectInterpretation, setAspectInterpretation] = useState(null);
  const [loadingBase, setLoadingBase] = useState(false);
  const [loadingAspect, setLoadingAspect] = useState(false);
  const [error, setError] = useState(null);
  const [provider, setProvider] = useState(null); // track which model responded

  const handleSetKey = () => {
    if (apiKey.trim()) {
      window.OPENROUTER_API_KEY = apiKey.trim();
      setKeySet(true);
    }
  };

  const handleAnalyze = async () => {
    if (!input) return;
    setError(null);
    setBaseInterpretation(null);
    setAspectInterpretation(null);
    setProvider(null);

    const result = analyzeNumber(input);
    setAnalysis(result);
    setLoadingBase(true);

    try {
      const { text, provider: p } = await callClaude(buildBasePrompt(result));
      setBaseInterpretation(text);
      setProvider(p);
    } catch (e) {
      setError(`Base reading failed: ${e.message}`);
    } finally {
      setLoadingBase(false);
    }

    if (aspect) {
      setLoadingAspect(true);
      try {
        const { text } = await callClaude(buildAspectPrompt(result, aspect));
        setAspectInterpretation(text);
      } catch (e) {
        setError(`Aspect reading failed: ${e.message}`);
      } finally {
        setLoadingAspect(false);
      }
    }
  };

  const handleAspectChange = async (newAspect) => {
    setAspect(newAspect);
    if (!analysis) return;
    setAspectInterpretation(null);
    setLoadingAspect(true);
    setError(null);
    try {
      const { text } = await callClaude(buildAspectPrompt(analysis, newAspect));
      setAspectInterpretation(text);
    } catch (e) {
      setError(`Aspect reading failed: ${e.message}`);
    } finally {
      setLoadingAspect(false);
    }
  };

  const interpretation = [baseInterpretation, aspectInterpretation].filter(Boolean).join("\n\n");

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "#e2e8f0", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #1e293b", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #f59e0b, #d97706)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>☯</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.05em", color: "#f1f5f9" }}>八宅飛星</div>
            <div style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.15em", textTransform: "uppercase" }}>Numerology Reader</div>
          </div>
        </div>

        {/* Mode tabs + provider badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {provider && (
            <div style={{
              fontSize: 11, padding: "4px 10px", borderRadius: 20,
              background: provider.includes("qwen") ? "rgba(139,92,246,0.15)" : "rgba(245,158,11,0.15)",
              border: `1px solid ${provider.includes("qwen") ? "#7c3aed" : "#d97706"}`,
              color: provider.includes("qwen") ? "#a78bfa" : "#f59e0b",
              letterSpacing: "0.05em",
            }}>
              {provider.includes("qwen") ? "🟣 Qwen" : "🟡 Claude"} · {provider.split("/").pop()}
            </div>
          )}
          <div style={{ display: "flex", gap: 4, background: "#1e293b", borderRadius: 8, padding: 4 }}>
            {[["read", "📖 Read"], ["compare", "⚖️ Compare"]].map(([m, label]) => (
              <button key={m} onClick={() => setMode(m)} style={{
                padding: "6px 16px", borderRadius: 6, border: "none",
                background: mode === m ? "#334155" : "transparent",
                color: mode === m ? "#f1f5f9" : "#64748b",
                fontSize: 13, fontWeight: mode === m ? 600 : 400,
                cursor: "pointer", transition: "all 0.15s",
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>

        {/* API Key Setup */}
        {!keySet && (
          <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12, padding: 20, marginBottom: 24, display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "#64748b", flexShrink: 0 }}>🔑 OpenRouter Key</span>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-or-..."
              onKeyDown={e => e.key === "Enter" && handleSetKey()}
              style={{
                flex: 1, background: "#1e293b", border: "1px solid #334155",
                borderRadius: 8, padding: "8px 12px", fontSize: 13,
                color: "#f1f5f9", outline: "none", fontFamily: "monospace",
              }}
            />
            <button onClick={handleSetKey} style={{
              padding: "8px 16px", borderRadius: 8, border: "none",
              background: "#f59e0b", color: "#0a0f1e",
              fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0,
            }}>Set Key</button>
          </div>
        )}

        {keySet && (
          <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#16a34a" }}>✓ OpenRouter connected</span>
            <button onClick={() => { setKeySet(false); setApiKey(""); window.OPENROUTER_API_KEY = ""; }}
              style={{ fontSize: 11, color: "#475569", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              change key
            </button>
          </div>
        )}
        {mode === "compare" ? (
          <ComparePanel />
        ) : (
          <>
            <InputPanel
              input={input}
              aspect={aspect}
              onInputChange={setInput}
              onAspectChange={handleAspectChange}
              onAnalyze={handleAnalyze}
              loading={loadingBase}
              hasAnalysis={!!analysis}
            />
            {analysis && (
              <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 20 }}>
                <SequenceDisplay analysis={analysis} />
                <ScoreDisplay analysis={analysis} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <PairTable pairs={analysis.pairs} />
                  <RadarPanel categoryTotals={analysis.categoryTotals} />
                </div>
                <InterpretationPanel
                  interpretation={interpretation}
                  loadingBase={loadingBase}
                  loadingAspect={loadingAspect}
                  error={error}
                  aspect={aspect}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
