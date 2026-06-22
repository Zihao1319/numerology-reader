import { describe, it, expect } from "vitest";
import {
  analyzeNumber,
  detectCombinations,
  applyCombinationScoring,
  tokenize,
  annotatePairs,
  computePairScore,
  expandLetters,
  CATEGORY_SEEDS_V2,
  AUSPICIOUS,
  INAUSPICIOUS,
  nodeSize,
  transitionGlyph,
  energyRows,
} from "./engine.js";

// ─── CATEGORY_SEEDS_V2 ────────────────────────────────────────────────────────

describe("CATEGORY_SEEDS_V2", () => {
  const ALL_CATS = ["生氣", "天醫", "延年", "伏位", "絕命", "五鬼", "六煞", "禍害"];

  it("every category has non-empty core/light/shadow", () => {
    for (const cat of ALL_CATS) {
      const seed = CATEGORY_SEEDS_V2[cat];
      expect(seed, `missing ${cat}`).toBeDefined();
      expect(seed.core.trim(), `${cat}.core empty`).not.toBe("");
      expect(seed.light.trim(), `${cat}.light empty`).not.toBe("");
      expect(seed.shadow.trim(), `${cat}.shadow empty`).not.toBe("");
    }
  });

  it("every category has >= 3 domains", () => {
    for (const cat of ALL_CATS) {
      expect(CATEGORY_SEEDS_V2[cat].domains.length, `${cat} domains`).toBeGreaterThanOrEqual(3);
    }
  });
});

// ─── TOKENIZER ────────────────────────────────────────────────────────────────

describe("expandLetters", () => {
  it("leaves digits unchanged", () => {
    expect(expandLetters("1234")).toBe("1234");
  });
  it("expands A→01 J→10", () => {
    expect(expandLetters("AJ")).toBe("0110");
  });
});

describe("tokenize", () => {
  it("direct pair 14 → 生氣 intensity 4", () => {
    const tokens = tokenize(["1", "4"]);
    expect(tokens).toHaveLength(1);
    expect(tokens[0].category).toBe("生氣");
    expect(tokens[0].intensity).toBe(4);
  });

  it("adjacent-0 rule: 01 → 11 伏位", () => {
    const tokens = tokenize(["0", "1"]);
    expect(tokens[0].category).toBe("伏位");
    expect(tokens[0].rule).toBe("adjacent-0");
  });

  it("middle-5-bridge: 154 → 14 doubled", () => {
    const tokens = tokenize(["1", "5", "4"]);
    expect(tokens).toHaveLength(2);
    expect(tokens[0].resolvedPair).toBe("14");
    expect(tokens[1].resolvedPair).toBe("14");
    expect(tokens[0].isDoubled).toBe(true);
  });
});

// ─── DETECT COMBINATIONS ─────────────────────────────────────────────────────

function makePairs(cats) {
  return cats.map((cat, i) => {
    const isAusp = AUSPICIOUS.includes(cat);
    const isInaup = INAUSPICIOUS.includes(cat);
    const pairScore = cat === "伏位" ? 50 : isAusp ? 70 : 30;
    return {
      position: i, category: cat, intensity: 2, pairScore,
      transitionType: i === 0 ? "opening" : "same-category",
    };
  });
}

describe("detectCombinations — 生天延", () => {
  it("detects ordered triple", () => {
    const pairs = makePairs(["生氣", "天醫", "延年"]);
    const { combinations } = detectCombinations(pairs);
    expect(combinations.some(c => c.type === "生天延")).toBe(true);
  });

  it("does NOT detect if out of order", () => {
    const pairs = makePairs(["天醫", "生氣", "延年"]);
    const { combinations } = detectCombinations(pairs);
    expect(combinations.some(c => c.type === "生天延")).toBe(false);
  });
});

describe("detectCombinations — 五鬼 remedied by 生天延", () => {
  it("五鬼 remediedBy=生天延 when 生天延 present anywhere", () => {
    const pairs = makePairs(["生氣", "天醫", "延年", "五鬼"]);
    const { pairFlags } = detectCombinations(pairs);
    expect(pairFlags[3].remediedBy).toBe("生天延");
  });

  it("五鬼 unremedied when no 生天延 and no 延年伏位", () => {
    const pairs = makePairs(["絕命", "五鬼", "六煞"]);
    const { pairFlags } = detectCombinations(pairs);
    expect(pairFlags[1].unremedied).toBe(true);
    expect(pairFlags[1].remediedBy).toBeNull();
  });

  it("五鬼 remediedBy=延年伏位 when 延年伏位 pair present", () => {
    const pairs = makePairs(["延年", "伏位", "五鬼"]);
    const { pairFlags } = detectCombinations(pairs);
    expect(pairFlags[2].remediedBy).toBe("延年伏位");
  });
});

describe("detectCombinations — adjacency remedies", () => {
  it("絕命 adjacent 天醫 → remedied", () => {
    const pairs = makePairs(["絕命", "天醫"]);
    const { pairFlags } = detectCombinations(pairs);
    expect(pairFlags[0].remediedBy).toBe("天醫");
  });

  it("絕命 not adjacent 天醫 → unremedied", () => {
    const pairs = makePairs(["絕命", "五鬼"]);
    const { pairFlags } = detectCombinations(pairs);
    expect(pairFlags[0].unremedied).toBe(true);
  });

  it("六煞 adjacent 延年 → remedied", () => {
    const pairs = makePairs(["延年", "六煞"]);
    const { pairFlags } = detectCombinations(pairs);
    expect(pairFlags[1].remediedBy).toBe("延年");
  });

  it("禍害 adjacent 生氣 → remedied", () => {
    const pairs = makePairs(["禍害", "生氣"]);
    const { pairFlags } = detectCombinations(pairs);
    expect(pairFlags[0].remediedBy).toBe("生氣");
  });
});

describe("detectCombinations — 伏位 activation", () => {
  it("伏位 next to 生氣 → activated=true", () => {
    const pairs = makePairs(["生氣", "伏位"]);
    const { pairFlags } = detectCombinations(pairs);
    expect(pairFlags[1].activated).toBe(true);
    expect(pairFlags[1].activatedBy).toBe("生氣");
  });

  it("伏位 next to 絕命 → activated=false", () => {
    const pairs = makePairs(["絕命", "伏位"]);
    const { pairFlags } = detectCombinations(pairs);
    expect(pairFlags[1].activated).toBe(false);
    expect(pairFlags[1].activatedBy).toBeNull();
  });
});

describe("detectCombinations — 吉星疊加", () => {
  it("contiguous auspicious run with all three → 吉星疊加", () => {
    const pairs = makePairs(["生氣", "天醫", "延年", "伏位"]);
    const { combinations } = detectCombinations(pairs);
    expect(combinations.some(c => c.type === "吉星疊加")).toBe(true);
  });

  it("all three present but not contiguous → no 吉星疊加", () => {
    const pairs = makePairs(["生氣", "絕命", "天醫", "延年"]);
    const { combinations } = detectCombinations(pairs);
    expect(combinations.some(c => c.type === "吉星疊加")).toBe(false);
  });
});

describe("detectCombinations — 連續", () => {
  it("consecutive 五鬼 ×2 → 連續", () => {
    const pairs = makePairs(["五鬼", "五鬼"]);
    const { combinations, pairFlags } = detectCombinations(pairs);
    const run = combinations.find(c => c.type === "連續");
    expect(run).toBeDefined();
    expect(run.runLength).toBe(2);
    expect(pairFlags[0].inRun).toBe(true);
    expect(pairFlags[1].inRun).toBe(true);
  });

  it("no 連續 for single category", () => {
    const pairs = makePairs(["生氣", "天醫"]);
    const { combinations } = detectCombinations(pairs);
    expect(combinations.some(c => c.type === "連續")).toBe(false);
  });
});

// ─── COMBINATION SCORING ──────────────────────────────────────────────────────

describe("applyCombinationScoring — AC-6.5 parity", () => {
  it("no combinations → adjustedPairScore === pairScore", () => {
    const pairs = annotatePairs(tokenize(["2", "6"]));
    const pairsWithFlags = pairs.map(p => ({ ...p, remediedBy: null, unremedied: false, activated: null, activatedBy: null, inRun: false }));
    const { scored, finalScore } = applyCombinationScoring(pairsWithFlags, []);
    for (const p of scored) {
      expect(p.adjustedPairScore).toBe(p.pairScore);
    }
    const avgRaw = Math.round(pairs.reduce((s, p) => s + p.pairScore, 0) / pairs.length);
    expect(finalScore).toBe(avgRaw);
  });
});

describe("applyCombinationScoring — remedied 凶 softened", () => {
  it("remedied 絕命 closer to 50 than raw", () => {
    const base = 0;
    const pairs = makePairs(["絕命"]);
    const flags = [{ remediedBy: "天醫", unremedied: false, activated: null, activatedBy: null, inRun: false }];
    const pairsWithFlags = pairs.map((p, i) => ({ ...p, ...flags[i] }));
    const { scored } = applyCombinationScoring(pairsWithFlags, []);
    expect(scored[0].adjustedPairScore).toBeGreaterThan(base);
    expect(scored[0].adjustedPairScore).toBeLessThanOrEqual(50);
  });
});

describe("applyCombinationScoring — unremedied 凶 lower", () => {
  it("unremedied 絕命 lower than raw (already at floor 0 for i4 — check i2)", () => {
    const pairs = [{ ...makePairs(["絕命"])[0], intensity: 2, pairScore: 30 }];
    const flags = [{ remediedBy: null, unremedied: true, activated: null, activatedBy: null, inRun: false }];
    const pairsWithFlags = pairs.map((p, i) => ({ ...p, ...flags[i] }));
    const { scored } = applyCombinationScoring(pairsWithFlags, []);
    expect(scored[0].adjustedPairScore).toBeLessThan(30);
  });
});

describe("applyCombinationScoring — 連續 凶 amplifies downward", () => {
  it("consecutive 五鬼 score lower than without run", () => {
    const pairs = makePairs(["五鬼", "五鬼"]);
    const { pairFlags } = detectCombinations(pairs);
    const pairsWithFlags = pairs.map((p, i) => ({ ...p, ...pairFlags[i] }));
    const { scored } = applyCombinationScoring(pairsWithFlags, [{ type: "連續", kind: "amplify", range: [0, 1] }]);
    expect(scored[0].adjustedPairScore).toBeLessThan(30);
  });
});

describe("applyCombinationScoring — 伏位 dormant", () => {
  it("dormant 伏位 with elevated base pulled toward 50 (score reduced)", () => {
    // pairScore=70 simulates 伏位 that followed a strong auspicious pair and got boosted
    const pairs = [{ ...makePairs(["伏位"])[0], pairScore: 70 }];
    const flags = [{ remediedBy: null, unremedied: false, activated: false, activatedBy: null, inRun: false }];
    const pairsWithFlags = pairs.map((p, i) => ({ ...p, ...flags[i] }));
    const { scored } = applyCombinationScoring(pairsWithFlags, []);
    // dormant: 70 + (50-70)*0.30 = 70 - 6 = 64 — pulled toward 50 but still above it
    expect(scored[0].adjustedPairScore).toBeLessThan(70);
    expect(scored[0].adjustedPairScore).toBeGreaterThan(50);
  });
});

describe("applyCombinationScoring — scoreReasons", () => {
  it("remedied pair has non-empty scoreReasons", () => {
    const pairs = makePairs(["絕命"]);
    const flags = [{ remediedBy: "天醫", unremedied: false, activated: null, activatedBy: null, inRun: false }];
    const pairsWithFlags = pairs.map((p, i) => ({ ...p, ...flags[i] }));
    const { scored } = applyCombinationScoring(pairsWithFlags, []);
    expect(scored[0].scoreReasons.length).toBeGreaterThan(0);
  });

  it("no-combo pair has empty scoreReasons", () => {
    const pairs = makePairs(["生氣"]);
    const flags = [{ remediedBy: null, unremedied: false, activated: null, activatedBy: null, inRun: false }];
    const pairsWithFlags = pairs.map((p, i) => ({ ...p, ...flags[i] }));
    const { scored } = applyCombinationScoring(pairsWithFlags, []);
    expect(scored[0].scoreReasons).toHaveLength(0);
  });
});

describe("applyCombinationScoring — bounds", () => {
  it("score always in [0, 100]", () => {
    const cats = ["生氣", "天醫", "延年", "伏位", "絕命", "五鬼", "六煞", "禍害", "五鬼", "五鬼"];
    const pairs = makePairs(cats);
    const { pairFlags, combinations } = detectCombinations(pairs);
    const pairsWithFlags = pairs.map((p, i) => ({ ...p, ...pairFlags[i] }));
    const { scored } = applyCombinationScoring(pairsWithFlags, combinations);
    for (const p of scored) {
      expect(p.adjustedPairScore).toBeGreaterThanOrEqual(0);
      expect(p.adjustedPairScore).toBeLessThanOrEqual(100);
    }
  });
});

describe("applyCombinationScoring — raw pairScore retained", () => {
  it("pairScore not overwritten by combo scoring", () => {
    const pairs = annotatePairs(tokenize(["1", "4"]));
    const pairsWithFlags = pairs.map(p => ({ ...p, remediedBy: "天醫", unremedied: false, activated: null, activatedBy: null, inRun: false }));
    const { scored } = applyCombinationScoring(pairsWithFlags, []);
    expect(scored[0].pairScore).toBe(pairs[0].pairScore);
    expect(scored[0].adjustedPairScore).not.toBeUndefined();
  });
});

// ─── ANALYZE NUMBER — integration ────────────────────────────────────────────

describe("analyzeNumber", () => {
  it("14 → 生氣 finalScore 100", () => {
    const r = analyzeNumber("14");
    expect(r.pairs).toHaveLength(1);
    expect(r.pairs[0].category).toBe("生氣");
    expect(r.finalScore).toBe(100);
    expect(r.scoreBand).toBe("Excellent");
  });

  it("26 → 延年 combinations empty", () => {
    const r = analyzeNumber("26");
    expect(r.combinations).toHaveLength(0);
  });

  it("生天延 number → hasCombo 生天延", () => {
    // "8278" → pairs: 82(生氣i1), 27(天醫i1), 78(延年i3) — clean ordered triple
    const r = analyzeNumber("8278");
    const types = r.combinations.map(c => c.type);
    expect(types).toContain("生天延");
  });

  it("no-combo number finalScore equals avg of pair scores", () => {
    const r = analyzeNumber("26");
    const avgRaw = Math.round(r.pairs.reduce((s, p) => s + p.pairScore, 0) / r.pairs.length);
    expect(r.finalScore).toBe(avgRaw);
  });
});

// ─── UI HELPERS ───────────────────────────────────────────────────────────────

describe("nodeSize", () => {
  it("intensity 1 → 34, 4 → 52", () => {
    expect(nodeSize(1)).toBe(34);
    expect(nodeSize(2)).toBe(40);
    expect(nodeSize(3)).toBe(46);
    expect(nodeSize(4)).toBe(52);
  });
});

describe("transitionGlyph", () => {
  it("ausp-to-inaup → reversal red", () => {
    const g = transitionGlyph("ausp-to-inaup");
    expect(g.label).toBe("reversal");
    expect(g.color).toBe("#dc2626");
  });
  it("unknown type → fallback arrow", () => {
    const g = transitionGlyph("unknown-type");
    expect(g.glyph).toBe("→");
  });
});

describe("energyRows", () => {
  it("sorted by total descending, filtered to non-zero", () => {
    const totals = { "生氣": 4, "天醫": 0, "延年": 2, "伏位": 0, "絕命": 3, "五鬼": 0, "六煞": 0, "禍害": 0 };
    const rows = energyRows(totals);
    expect(rows.some(r => r.total === 0)).toBe(false);
    expect(rows[0].total).toBeGreaterThanOrEqual(rows[1].total);
  });
  it("pct sums to 100 when no rounding edge", () => {
    const totals = { "生氣": 1, "天醫": 0, "延年": 1, "伏位": 0, "絕命": 0, "五鬼": 0, "六煞": 0, "禍害": 0 };
    const rows = energyRows(totals);
    const pctSum = rows.reduce((s, r) => s + r.pct, 0);
    expect(pctSum).toBe(100);
  });
});
