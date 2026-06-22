// Pure engine — no React, no DOM. Imported by App.jsx and engine.test.js.

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

export const AUSPICIOUS = ["生氣", "天醫", "延年", "伏位"];
export const INAUSPICIOUS = ["絕命", "五鬼", "六煞", "禍害"];

export const CATEGORY_META = {
  "生氣": { subtitle: "貴人", subtitleEn: "Benefactor", type: "吉" },
  "天醫": { subtitle: "財富", subtitleEn: "Wealth", type: "吉" },
  "延年": { subtitle: "責任", subtitleEn: "Longevity", type: "吉" },
  "伏位": { subtitle: "固執", subtitleEn: "Stability", type: "吉" },
  "絕命": { subtitle: "波動", subtitleEn: "Volatility", type: "凶" },
  "五鬼": { subtitle: "詭異", subtitleEn: "Erratic", type: "凶" },
  "六煞": { subtitle: "矛盾", subtitleEn: "Conflict", type: "凶" },
  "禍害": { subtitle: "衝擊", subtitleEn: "Impact", type: "凶" },
};

// Legacy flat seeds (fallback if V2 not available)
export const CATEGORY_SEEDS = {
  "生氣": "vitality, new beginnings, benefactors, opportunities, breakthroughs",
  "天醫": "wealth, healing, nourishment, wisdom, care",
  "延年": "longevity, endurance, commitment, responsibility, leadership",
  "伏位": "stability, stillness, hidden potential, waiting — elevator: amplifies or deflates preceding energy by intensity",
  "絕命": "separation, severance, endings, volatility, disruption",
  "五鬼": "hidden forces, unpredictability, strangeness, sabotage, erratic energy",
  "六煞": "entanglement, conflict, romance complications, interpersonal friction",
  "禍害": "sudden shocks, verbal disputes, unexpected loss, arguments",
};

// V2 structured seeds with light/shadow duality and life domains
export const CATEGORY_SEEDS_V2 = {
  "生氣": {
    core: "vitality, new beginnings, benefactors, opportunities",
    light: "breakthroughs, helpful people arriving, fresh starts",
    shadow: "restlessness, impulsiveness, inability to settle",
    domains: ["貴人", "新機遇", "人脈", "活力"],
  },
  "天醫": {
    core: "wealth, healing, nourishment, wisdom",
    light: "financial accumulation, care for others, intelligence",
    shadow: "naivety, over-giving, taken advantage of",
    domains: ["錢財", "婚姻", "業績", "智慧"],
  },
  "延年": {
    core: "longevity, endurance, leadership, commitment",
    light: "sustained effort, authority, long-term results",
    shadow: "stubbornness, rigidity, controlling tendencies",
    domains: ["事業", "專業能力", "責任", "領導"],
  },
  "伏位": {
    core: "stability, stillness, hidden potential, waiting",
    light: "patient accumulation, 一鳴驚人",
    shadow: "stagnation, passivity, missed opportunity",
    domains: ["蓄勢", "積蓄", "延續", "被動"],
  },
  "絕命": {
    core: "bold decisiveness, high volatility, severance",
    light: "daring pioneer, adventurous, loves travel",
    shadow: "impulsive loss, separation, feast-or-famine",
    domains: ["投資", "開支", "破財", "官司", "意外"],
  },
  "五鬼": {
    core: "unconventional intelligence, unpredictability",
    light: "creative genius, out-of-box thinker, artistic/entertainment talent",
    shadow: "erratic, hidden sabotage, trust issues",
    domains: ["變動", "異地", "偏才", "血光"],
  },
  "六煞": {
    core: "interpersonal magnetism, emotional entanglement",
    light: "high EQ, charming, strong network, romantic appeal",
    shadow: "affairs, indecision, melancholy, conflict",
    domains: ["偏桃花", "人緣", "憂鬱", "時尚"],
  },
  "禍害": {
    core: "verbal power, persuasion, mouth energy",
    light: "gifted speaker, natural salesman, convincing negotiator",
    shadow: "disputes, arguments, losing face, illness",
    domains: ["口才", "口舌是非", "小人", "病痛"],
  },
};

export const INTENSITY_LABELS = { 4: "PEAK (strongest)", 3: "STRONG", 2: "MODERATE", 1: "MILD (weakest)" };

export const ASPECT_GUIDANCE = {
  Housing: "Describe how this space feels to live in. Use atmospheric and experiential language. Address harmony, peace, unease, conflict, stagnation, vitality, warmth, or creepiness as relevant. How would a resident feel day-to-day?",
  Career: "Address momentum, obstacles, recognition, benefactor support, competition, visibility, and stability vs turbulence in professional life.",
  Wealth: "Address accumulation patterns, cash flow, income volatility, risk of loss, and wealth generation potential.",
  Relationship: "Address harmony vs conflict, emotional depth, attraction, stability, communication patterns, and power dynamics.",
  Health: "Address vitality levels, recovery capacity, chronic patterns, mental and emotional state, and energy fluctuations.",
};

export const PAIR_DESCRIPTIONS = {
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

export const LOOKUP = {
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

// ─── ENGINE — TOKENIZER ───────────────────────────────────────────────────────

export function expandLetters(input) {
  return input.toUpperCase().replace(/[A-Z]/g, ch => {
    const val = ch.charCodeAt(0) - 64;
    return val < 10 ? `0${val}` : `${val}`;
  });
}

export function tokenize(digits) {
  const tokens = [];
  let i = 0;
  while (i < digits.length - 1) {
    const a = digits[i], b = digits[i + 1];
    const c = i + 2 < digits.length ? digits[i + 2] : null;

    if ((a === "0" && b === "5") || (a === "5" && b === "0")) {
      const next = digits.slice(i + 2).find(d => d !== "0" && d !== "5");
      const fuwei = next ? next + next : "11";
      const entry = LOOKUP[fuwei] || { category: "伏位", intensity: 4 };
      tokens.push({ resolvedPair: fuwei, originalDigits: [a, b], rule: "zero-five-fuwei", modifier: "fuwei", isDoubled: false, category: entry.category, intensity: entry.intensity });
      i += 2; continue;
    }

    if (b === "5" && c && a !== "0" && a !== "5" && c !== "0" && c !== "5") {
      const pair = a + c;
      const entry = LOOKUP[pair];
      if (entry) {
        tokens.push({ resolvedPair: pair, originalDigits: [a, b, c], rule: "middle-5-bridge", modifier: "visible", isDoubled: true, category: entry.category, intensity: entry.intensity });
        tokens.push({ resolvedPair: pair, originalDigits: [a, b, c], rule: "middle-5-bridge-echo", modifier: "visible", isDoubled: true, category: entry.category, intensity: entry.intensity });
        i += 2; continue;
      }
    }

    if (b === "0" && c && a !== "0" && a !== "5" && c !== "0" && c !== "5") {
      const pair = a + c;
      const entry = LOOKUP[pair];
      if (entry) {
        tokens.push({ resolvedPair: pair, originalDigits: [a, b, c], rule: "middle-0-hidden", modifier: "hidden", isDoubled: false, category: entry.category, intensity: entry.intensity });
        i += 2; continue;
      }
    }

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

    if (a !== "0" && a !== "5" && b !== "0" && b !== "5") {
      const pair = a + b;
      const entry = LOOKUP[pair];
      tokens.push({ resolvedPair: pair, originalDigits: [a, b], rule: "direct", modifier: null, isDoubled: false, category: entry?.category || "unknown", intensity: entry?.intensity || null });
    }
    i += 1;
  }
  return tokens;
}

// ─── ENGINE — ANNOTATION ──────────────────────────────────────────────────────

export function annotatePairs(tokens) {
  const total = tokens.length;

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

    return {
      ...token,
      position: i, totalPairs: total, narrativeRole, transitionType, elevatorEffect,
      pairScore: null,
      precedingCategory: prev?.category || null,
      followingCategory: next?.category || null,
    };
  });

  for (let i = 0; i < annotated.length; i++) {
    annotated[i].pairScore = computePairScore(annotated[i], i > 0 ? annotated[i - 1] : null);
  }

  return annotated;
}

export function computePairScore(token, prev) {
  const { category, intensity } = token;
  if (category === "unknown" || intensity === null) return 50;
  if (category === "伏位") {
    if (!prev || prev.category === "unknown") return 50 + intensity * 5;
    const prevScore = prev.pairScore ?? 50;
    if (intensity >= 2) {
      const boost = intensity === 4 ? 0.3 : intensity === 3 ? 0.2 : 0.1;
      return prevScore > 50
        ? Math.min(100, Math.round(prevScore + (100 - prevScore) * boost))
        : Math.max(0, Math.round(prevScore - prevScore * boost));
    }
    return Math.round(prevScore + (50 - prevScore) * 0.3);
  }
  const isAusp = AUSPICIOUS.includes(category);
  return isAusp ? { 4: 100, 3: 85, 2: 70, 1: 60 }[intensity] : { 4: 0, 3: 15, 2: 30, 1: 40 }[intensity];
}

export function getScoreBand(score) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Mixed";
  if (score >= 30) return "Challenging";
  return "Unfavourable";
}

// ─── ENGINE — COMBINATION DETECTION ──────────────────────────────────────────

export function detectCombinations(pairs) {
  const cats = pairs.map(p => p.category);
  const total = cats.length;
  const combinations = [];

  // Initialize all flags
  const pairFlags = Array.from({ length: total }, (_, i) => ({
    remediedBy: null,
    unremedied: false,
    activated: cats[i] === "伏位" ? false : null,
    activatedBy: null,
    inRun: false,
  }));

  if (total === 0) return { combinations, pairFlags };

  // 2.1 生天延 ordered triple — sequence-level 五鬼 remedy
  let hasShengTianYan = false;
  for (let i = 0; i <= total - 3; i++) {
    if (cats[i] === "生氣" && cats[i + 1] === "天醫" && cats[i + 2] === "延年") {
      hasShengTianYan = true;
      combinations.push({
        type: "生天延",
        kind: "remedy",
        range: [i, i + 2],
        remedies: ["五鬼"],
        category: null,
        runLength: null,
        label: "生天延 — 制化五鬼",
      });
    }
  }

  // 2.2 延年+伏位 alt remedy for 五鬼
  let hasYanFuCombo = false;
  for (let i = 0; i < total - 1; i++) {
    if (
      (cats[i] === "延年" && cats[i + 1] === "伏位") ||
      (cats[i] === "伏位" && cats[i + 1] === "延年")
    ) {
      hasYanFuCombo = true;
      break;
    }
  }

  // 2.3 五鬼 status (sequence-level remedies)
  for (let i = 0; i < total; i++) {
    if (cats[i] !== "五鬼") continue;
    if (hasShengTianYan) {
      pairFlags[i].remediedBy = "生天延";
      combinations.push({
        type: "五鬼制化",
        kind: "remedy",
        range: [i, i],
        remedies: [],
        category: "五鬼",
        runLength: null,
        label: `五鬼制化 (pair ${i + 1}) — 生天延 protective run`,
      });
    } else if (hasYanFuCombo) {
      pairFlags[i].remediedBy = "延年伏位";
      combinations.push({
        type: "五鬼制化",
        kind: "remedy",
        range: [i, i],
        remedies: [],
        category: "五鬼",
        runLength: null,
        label: `五鬼制化 (pair ${i + 1}) — 延年伏位 combo`,
      });
    } else {
      pairFlags[i].unremedied = true;
    }
  }

  // 2.4 Adjacency remedies — immediate neighbour only (絕命/六煞/禍害)
  const adjacencyRules = {
    "絕命": { remedyCategory: "天醫", comboType: "絕命破解", label: i => `絕命破解 (pair ${i + 1}) — 天醫 adjacent` },
    "六煞": { remedyCategory: "延年", comboType: "六煞壓制", label: i => `六煞壓制 (pair ${i + 1}) — 延年 adjacent` },
    "禍害": { remedyCategory: "生氣", comboType: "禍害化解", label: i => `禍害化解 (pair ${i + 1}) — 生氣 adjacent` },
  };
  for (let i = 0; i < total; i++) {
    const rule = adjacencyRules[cats[i]];
    if (!rule) continue;
    const left = i > 0 ? cats[i - 1] : null;
    const right = i < total - 1 ? cats[i + 1] : null;
    if (left === rule.remedyCategory || right === rule.remedyCategory) {
      pairFlags[i].remediedBy = rule.remedyCategory;
      combinations.push({
        type: rule.comboType,
        kind: "remedy",
        range: [i, i],
        remedies: [],
        category: cats[i],
        runLength: null,
        label: rule.label(i),
      });
    } else {
      pairFlags[i].unremedied = true;
    }
  }

  // 2.5 吉星疊加 — smallest contiguous auspicious run containing all of 生氣+天醫+延年
  const ausptrio = new Set(["生氣", "天醫", "延年"]);
  let stackFound = false;
  for (let i = 0; i < total && !stackFound; i++) {
    if (!AUSPICIOUS.includes(cats[i])) continue;
    const found = new Set();
    let end = i;
    for (let j = i; j < total && AUSPICIOUS.includes(cats[j]); j++) {
      if (ausptrio.has(cats[j])) found.add(cats[j]);
      if (found.size === 3) { end = j; stackFound = true; break; }
    }
    if (stackFound) {
      combinations.push({
        type: "吉星疊加",
        kind: "stack",
        range: [i, end],
        remedies: [],
        category: null,
        runLength: null,
        label: "吉星疊加 — 最佳組合 (生氣+天醫+延年)",
      });
    }
  }

  // 2.6 伏位 activation
  const activators = new Set(["生氣", "天醫", "延年"]);
  for (let i = 0; i < total; i++) {
    if (cats[i] !== "伏位") continue;
    const left = i > 0 ? cats[i - 1] : null;
    const right = i < total - 1 ? cats[i + 1] : null;
    const activator = activators.has(left) ? left : activators.has(right) ? right : null;
    pairFlags[i].activated = activator !== null;
    pairFlags[i].activatedBy = activator;
  }

  // 2.7 連續 amplification
  let runStart = 0;
  while (runStart < total) {
    let runEnd = runStart;
    while (runEnd + 1 < total && cats[runEnd + 1] === cats[runStart]) runEnd++;
    const runLen = runEnd - runStart + 1;
    if (runLen >= 2 && cats[runStart] !== "unknown") {
      const isAusp = AUSPICIOUS.includes(cats[runStart]);
      combinations.push({
        type: "連續",
        kind: isAusp ? "stack" : "amplify",
        range: [runStart, runEnd],
        remedies: [],
        category: cats[runStart],
        runLength: runLen,
        label: `連續 ${cats[runStart]} ×${runLen} — ${isAusp ? "吉力倍增" : "凶力加深"}`,
      });
      for (let k = runStart; k <= runEnd; k++) pairFlags[k].inRun = true;
    }
    runStart = runEnd + 1;
  }

  return { combinations, pairFlags };
}

// ─── ENGINE — COMBINATION SCORING ────────────────────────────────────────────

export function applyCombinationScoring(pairsWithFlags, combinations) {
  const hasShengTianYan = combinations.some(c => c.type === "生天延");
  const hasJiStack = combinations.some(c => c.type === "吉星疊加");

  const scored = pairsWithFlags.map(p => {
    const base = p.pairScore ?? 50;
    const reasons = [];
    let adj = base;
    const isXiong = INAUSPICIOUS.includes(p.category);
    const isJi = AUSPICIOUS.includes(p.category) && p.category !== "伏位";
    const isFuwei = p.category === "伏位";

    // Rule 1: remedied 凶 → soften toward 50
    if (isXiong && p.remediedBy) {
      const delta = Math.round((50 - base) * 0.40);
      adj = base + delta;
      reasons.push(`remedied ${delta >= 0 ? "+" : ""}${delta}`);
    }
    // Rule 2: unremedied 凶 → push 20% toward floor
    else if (isXiong && p.unremedied) {
      const delta = Math.round(-base * 0.20);
      adj = base + delta;
      reasons.push(`full force ${delta}`);
    }

    // Rule 3: 連續 amplification
    if (p.inRun) {
      if (isXiong) {
        const delta = Math.round(-adj * 0.15);
        adj = adj + delta;
        reasons.push(`連續 凶 ${delta}`);
      } else if (isJi) {
        const delta = Math.round((100 - adj) * 0.15);
        adj = adj + delta;
        reasons.push(`連續 吉 +${delta}`);
      }
    }

    // Rule 4: 伏位 dormant penalty
    if (isFuwei && p.activated === false) {
      const delta = Math.round((50 - adj) * 0.30);
      adj = adj + delta;
      reasons.push(`伏位 dormant ${delta >= 0 ? "+" : ""}${delta}`);
    }

    const adjustedPairScore = Math.min(100, Math.max(0, Math.round(adj)));
    return { ...p, adjustedPairScore, scoreReasons: reasons };
  });

  let finalAvg = scored.length > 0
    ? scored.reduce((s, p) => s + p.adjustedPairScore, 0) / scored.length
    : 50;
  if (hasShengTianYan) finalAvg += 3;
  if (hasJiStack) finalAvg += 3;
  const finalScore = Math.min(100, Math.max(0, Math.round(finalAvg)));

  return { scored, finalScore };
}

// ─── ENGINE — BRIEF BUILDER ───────────────────────────────────────────────────

export function buildBrief(pairs) {
  return pairs.map((p, i) => {
    const iLabel = p.intensity ? INTENSITY_LABELS[p.intensity] : "unknown";
    const type = p.category !== "unknown" ? (AUSPICIOUS.includes(p.category) ? "吉" : "凶") : "";
    const score = p.adjustedPairScore ?? p.pairScore;
    const seedV2 = CATEGORY_SEEDS_V2[p.category];
    const lines = [
      `[${i + 1}] ${p.originalDigits.join("")}→${p.resolvedPair} | ${p.category} ${type} | intensity ${p.intensity}/4 (${iLabel}) | score ${score}`,
    ];

    if (seedV2) {
      lines.push(`    Light: ${seedV2.light}  | Shadow: ${seedV2.shadow}  | Domains: ${seedV2.domains.join("、")}`);
    } else {
      const seed = CATEGORY_SEEDS[p.category] || "unknown pair";
      lines.push(`    Meaning: ${seed}`);
    }

    lines.push(`    Role: ${p.narrativeRole.toUpperCase()}`);
    if (p.modifier && p.modifier !== "fuwei") lines.push(`    Modifier: ${p.modifier}`);

    // Combination status
    if (p.remediedBy) {
      lines.push(`    Status: REMEDIED by ${p.remediedBy}`);
    } else if (p.unremedied) {
      lines.push(`    Status: UNREMEDIED — full 凶 force`);
    }
    if (p.category === "伏位") {
      if (p.activated === false) lines.push(`    伏位: dormant (no 吉 neighbour)`);
      else if (p.activated === true) lines.push(`    伏位: activated by ${p.activatedBy}`);
    }

    // Transition lines (preserved from original)
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

export function buildCombinationsBlock(combinations) {
  if (!combinations || combinations.length === 0) return "";
  const lines = ["COMBINATIONS DETECTED:"];
  for (const c of combinations) {
    const pairRef = c.range[0] === c.range[1]
      ? `pair ${c.range[0] + 1}`
      : `pairs ${c.range[0] + 1}–${c.range[1] + 1}`;
    lines.push(`- ${c.label} (${pairRef})`);
  }
  return lines.join("\n");
}

// ─── ENGINE — PROMPT BUILDERS ─────────────────────────────────────────────────

export function buildBasePrompt(analysis) {
  const combosBlock = buildCombinationsBlock(analysis.combinations);
  return `You are a 八宅飛星數字磁場 numerology reader with deep knowledge of Chinese metaphysics.

Number: ${analysis.input}
Score: ${analysis.finalScore}/100 (${analysis.scoreBand})
吉: ${analysis.auspiciousTotal} | 凶: ${analysis.inauspiciousTotal}

八大磁場含義 (Eight Category Meanings):
生氣 — 貴人、新機遇、突破、活力、新開始 | Light: breakthroughs, benefactors | Shadow: restlessness, impulsiveness
天醫 — 財富、療癒、滋養、智慧、財運亨通 | Light: wealth, care, intelligence | Shadow: naivety, over-giving
延年 — 長壽、耐力、領導力、承擔責任、持久成果 | Light: authority, sustained effort | Shadow: stubbornness, rigidity
伏位 — 穩定、蓄勢待發、隱藏潛力、等待時機、一鳴驚人 (elevator: amplifies/deflates preceding energy)
絕命 — 決斷力、冒險精神、大起大落、敢拼敢闖、喜歡旅行或不安定 | Shadow: separation, sudden loss, volatile
五鬼 — 鬼才、創意天賦、非常規思維、演藝體育宗教界天才 | Shadow: erratic, hidden sabotage, instability
六煞 — 人際磁場強、情商高、八面玲瓏、桃花旺、社交能力強 | Shadow: entanglement, affairs, indecision
禍害 — 口才好、說服力強、天生業務員、談判高手、891=說話能力帶來成果 | Shadow: disputes, verbal conflict

重要原則: 凶星代表才華與能量，不一定是壞事。讀數字要看組合與context，不能單純論吉凶。

SEQUENCE:
${analysis.brief}
${combosBlock ? `\n${combosBlock}\n\nWeight your reading by the COMBINATIONS — a remedied 凶 is softened; an unremedied or 連續 凶 hits at full force.` : ""}

Write exactly five sections, each header on its own line. Output in English. Be direct and analytical — name each pair explicitly, state what it means plainly, connect cause-effect. No metaphors. No poetic language. Intensity matters — PEAK is stronger than MILD.

JOURNEY READING
Read sequentially, 2–3 sentences. First pair = opening energy. Use plain cause-effect: "which leads to", "followed by", "ending with". Name each major pair or cluster explicitly.

DOMINANT THEME
One sentence: the single strongest force shaping this number overall.

KEY TENSION
One sentence: the main internal conflict or trade-off in this number (吉 vs 凶, remedy vs amplify, etc.).

STRENGTHS & RISKS
List 2–3 items. Put each on its own line, each line starting with either "Strength:" or "Risk:". Grounded in actual pairs.

CUMULATIVE READING
One sentence: overall energy. One sentence: what this number fundamentally represents.`;
}

export function buildAspectPrompt(analysis, aspect) {
  const combosBlock = buildCombinationsBlock(analysis.combinations);
  return `You are a 八宅飛星數字磁場 numerology reader with deep knowledge of Chinese metaphysics.

Number: ${analysis.input} | Score: ${analysis.finalScore}/100 (${analysis.scoreBand})

八大磁場含義:
生氣 — 貴人、新機遇、突破、活力 | Light: benefactors, fresh starts | Shadow: restlessness
天醫 — 財富、療癒、滋養、智慧 | Light: wealth, care | Shadow: naivety, over-giving
延年 — 長壽、耐力、領導力、責任 | Light: authority, endurance | Shadow: stubbornness
伏位 — 穩定、蓄勢待發、電梯效應（放大或縮小前一個磁場）
絕命 — 決斷、冒險、大起大落 | Shadow: separation, loss, volatile
五鬼 — 鬼才、創意 | Shadow: erratic, hidden sabotage
六煞 — 人際磁場、情商、桃花 | Shadow: entanglement, conflict, melancholy
禍害 — 口才、說服力、業務能力 | Shadow: disputes, verbal conflict, illness

凶星 = 才華能量，不一定壞。看組合和context決定正面還是負面表達。

SEQUENCE:
${analysis.brief}
${combosBlock ? `\n${combosBlock}\n\nWeight: remedied 凶 is softened; unremedied/連續 凶 hits full force.` : ""}

Write a focused ${aspect} reading. EVERY sentence must be about ${aspect} specifically — do NOT give a generic personality reading. Output in English. Name each pair explicitly and connect it to ${aspect}. Direct and analytical, no metaphors, no poetic language. Intensity matters — PEAK hits harder than MILD. For any 凶 categories present, give the light-side (talent/capability) and the shadow-side (risk) as they apply to ${aspect}.

Write exactly four sections, each header on its own line:

${aspect.toUpperCase()} JOURNEY
3–4 sentences. Read the sequence in order through the lens of ${aspect}. First pair = opening, last pair = outcome. ${ASPECT_GUIDANCE[aspect]}

${aspect.toUpperCase()} OUTLOOK
Two sentences: the single dominant force shaping ${aspect} in this number, and the main tension or trade-off for ${aspect}.

STRENGTHS & RISKS
List 2–3 items specific to ${aspect}. Put each on its own line, each line starting with either "Strength:" or "Risk:". Grounded in actual pairs.

${aspect.toUpperCase()} VERDICT
Two sentences: the overall ${aspect} outlook, and one concrete thing to do or watch for regarding ${aspect}.`;
}

// ─── ENGINE — MAIN ANALYSIS ───────────────────────────────────────────────────

export function analyzeNumber(input) {
  const stripped = input.replace(/[^a-zA-Z0-9]/g, "");
  const expanded = expandLetters(stripped);
  const rawDigits = expanded.split("");
  const tokens = tokenize(rawDigits);
  const pairs = annotatePairs(tokens);

  // Combination detection → merge flags onto pairs
  const { combinations, pairFlags } = detectCombinations(pairs);
  const pairsWithFlags = pairs.map((p, i) => ({ ...p, ...pairFlags[i] }));

  // Score adjustment using combination flags
  const { scored, finalScore } = applyCombinationScoring(pairsWithFlags, combinations);

  const categoryTotals = Object.fromEntries([...AUSPICIOUS, ...INAUSPICIOUS].map(c => [c, 0]));
  let auspiciousTotal = 0, inauspiciousTotal = 0;
  scored.forEach(p => {
    if (p.category !== "unknown" && p.intensity) {
      categoryTotals[p.category] += p.intensity;
      if (AUSPICIOUS.includes(p.category)) auspiciousTotal += p.intensity;
      else inauspiciousTotal += p.intensity;
    }
  });

  const avgScore = scored.length > 0
    ? scored.reduce((s, p) => s + p.adjustedPairScore, 0) / scored.length
    : 50;

  return {
    input, rawDigits,
    pairs: scored,
    combinations,
    categoryTotals, auspiciousTotal, inauspiciousTotal,
    averagePairScore: Math.round(avgScore),
    finalScore,
    scoreBand: scored.length === 0 ? "Void" : getScoreBand(finalScore),
    brief: buildBrief(scored),
  };
}

// ─── UI PURE HELPERS (no React, exported for tests) ──────────────────────────

// AC-1.1: node diameter by intensity
export function nodeSize(intensity) {
  return 28 + (intensity || 1) * 6; // i1=34 i2=40 i3=46 i4=52
}

const TRANSITION_GLYPHS = {
  "ausp-to-inaup":    { glyph: "⤵", label: "reversal",  color: "#dc2626" },
  "inaup-to-ausp":    { glyph: "⤴", label: "recovery",  color: "#16a34a" },
  "same-category":    { glyph: "↺", label: "reinforce",  color: null },
  "ausp-to-ausp":     { glyph: "⇈", label: "compound+", color: "#16a34a" },
  "inaup-to-inaup":   { glyph: "⇊", label: "compound−", color: "#dc2626" },
  "fuwei-amplify":    { glyph: "↑",  label: "amplify",   color: "#16a34a" },
  "fuwei-deflate":    { glyph: "↓",  label: "deflate",   color: "#64748b" },
  "fuwei-standalone": { glyph: "◼",  label: "stable",    color: "#f59e0b" },
  "opening":          { glyph: "·",  label: "",          color: "#475569" },
  "solo":             { glyph: "·",  label: "",          color: "#475569" },
};

// AC-1.2: glyph + label + color for a transition type
export function transitionGlyph(transitionType) {
  return TRANSITION_GLYPHS[transitionType] || { glyph: "→", label: "", color: "#475569" };
}

// AC-4.1: sorted energy rows for EnergyProfile
export function energyRows(categoryTotals) {
  const sum = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  return [...AUSPICIOUS, ...INAUSPICIOUS]
    .map(cat => ({
      category: cat,
      subtitle: CATEGORY_META[cat]?.subtitle || "",
      subtitleEn: CATEGORY_META[cat]?.subtitleEn || "",
      total: categoryTotals[cat] || 0,
      isAusp: AUSPICIOUS.includes(cat),
      pct: sum > 0 ? Math.round((categoryTotals[cat] || 0) / sum * 100) : 0,
    }))
    .filter(r => r.total > 0)
    .sort((a, b) => b.total - a.total);
}
