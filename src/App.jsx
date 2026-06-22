import { useState, useEffect } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import {
  AUSPICIOUS, INAUSPICIOUS, CATEGORY_META, CATEGORY_SEEDS_V2,
  analyzeNumber, buildBasePrompt, buildAspectPrompt,
  nodeSize, transitionGlyph, energyRows,
} from "./engine.js";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const ASPECTS = [
  { key: "Housing", emoji: "🏠", label: "Housing" },
  { key: "Career", emoji: "💼", label: "Career" },
  { key: "Wealth", emoji: "💰", label: "Wealth" },
  { key: "Relationship", emoji: "❤️", label: "Relationship" },
  { key: "Health", emoji: "🏥", label: "Health" },
];
const ASPECT_EMOJI = Object.fromEntries(ASPECTS.map(a => [a.key, a.emoji]));

const BAND_COLORS = {
  Excellent: "#16a34a", Good: "#0d9488", Mixed: "#d97706",
  Challenging: "#ea580c", Unfavourable: "#dc2626", Void: "#475569",
};
const BAND_LABELS = {
  Excellent: "✨ Excellent", Good: "👍 Good", Mixed: "🔶 Mixed",
  Challenging: "⚠️ Challenging", Unfavourable: "🔴 Unfavourable", Void: "∅ Void",
};

const COMBO_KIND_COLORS = {
  remedy: { bg: "#16a34a12", border: "#16a34a40", text: "#16a34a", badge: "制化" },
  stack:  { bg: "#0d908812", border: "#0d908840", text: "#0d9488", badge: "疊加" },
  amplify:{ bg: "#dc262612", border: "#dc262640", text: "#dc2626", badge: "加深" },
};

// icon for a parsed section header (keyword match — handles aspect-prefixed headers)
function iconFor(title) {
  const t = title.toUpperCase();
  if (t.includes("JOURNEY")) return "🔀";
  if (t.includes("STRENGTH") || t.includes("RISK")) return "📊";
  if (t.includes("TENSION")) return "⚖️";
  if (t.includes("THEME") || t.includes("OUTLOOK")) return "🎯";
  if (t.includes("VERDICT") || t.includes("CUMULATIVE")) return "∑";
  if (t.includes("HOUSING") || t.includes("LIVING")) return "🏠";
  if (t.includes("CAREER")) return "💼";
  if (t.includes("WEALTH")) return "💰";
  if (t.includes("RELATIONSHIP")) return "❤️";
  if (t.includes("HEALTH")) return "🏥";
  return "✦";
}

// ─── HOOKS ────────────────────────────────────────────────────────────────────

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia("(max-width: 640px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const handler = e => setMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return mobile;
}

// ─── LLM API ─────────────────────────────────────────────────────────────────

async function callLLM(prompt) {
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

// ─── SHARED ───────────────────────────────────────────────────────────────────

function Chip({ children, color }) {
  return (
    <div style={{ padding: "2px 8px", borderRadius: 4, border: `1px solid ${color}`, color, fontSize: 12, fontFamily: "monospace", letterSpacing: "0.05em" }}>
      {children}
    </div>
  );
}

function ScoreBadge({ analysis, size = 64 }) {
  const color = BAND_COLORS[analysis.scoreBand] || "#475569";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%", border: `3px solid ${color}`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: `${color}10`,
      }}>
        <div style={{ fontSize: size * 0.34, fontWeight: 800, color, lineHeight: 1 }}>{analysis.finalScore}</div>
        <div style={{ fontSize: size * 0.13, color: "#64748b" }}>/ 100</div>
      </div>
      <div style={{ fontSize: 12, color, fontWeight: 600, whiteSpace: "nowrap" }}>{BAND_LABELS[analysis.scoreBand]}</div>
    </div>
  );
}

// ─── INPUT ────────────────────────────────────────────────────────────────────

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
          Reading Focus {hasAnalysis && <span style={{ color: "#475569", textTransform: "none", letterSpacing: 0 }}>— click to switch (re-reads)</span>}
        </label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => onAspectChange(null)} style={{
            padding: "8px 16px", borderRadius: 8, border: "1px solid",
            borderColor: aspect === null ? "#f59e0b" : "#334155",
            background: aspect === null ? "rgba(245,158,11,0.15)" : "transparent",
            color: aspect === null ? "#f59e0b" : "#94a3b8",
            fontSize: 13, cursor: "pointer",
          }}>
            ☯ General
          </button>
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

// ─── INTERPRETATION (PRIMARY) ─────────────────────────────────────────────────

// Generic parser: a header is a short, all-caps line (allows & ' -). Everything
// until the next header is that section's body. Handles aspect-prefixed headers.
function parseInterpretation(text) {
  const lines = text.split("\n");
  const sections = [];
  let cur = null;
  // strip surrounding markdown (**, #) before testing
  const clean = (l) => l.trim().replace(/^[#*\s]+/, "").replace(/[*\s]+$/, "");
  const isHeader = (l) => {
    const t = clean(l);
    return t.length > 0 && t.length <= 42 && /[A-Z]/.test(t) && /^[A-Z0-9][A-Z0-9 &':’\-]+$/.test(t);
  };
  for (const line of lines) {
    if (isHeader(line)) {
      cur = { title: clean(line).replace(/[:\s]+$/, ""), content: "" };
      sections.push(cur);
    } else if (cur) {
      cur.content += (cur.content ? "\n" : "") + line;
    }
  }
  return sections.map(s => ({ ...s, content: s.content.trim() })).filter(s => s.content);
}

function StrengthsRisks({ content }) {
  const lines = content.split("\n").map(l => l.trim()).filter(Boolean);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {lines.map((line, j) => {
        const upper = line.toUpperCase();
        const isStrength = upper.startsWith("STRENGTH");
        const isRisk = upper.startsWith("RISK");
        const color = isStrength ? "#16a34a" : isRisk ? "#dc2626" : "#cbd5e1";
        const dot = isStrength ? "▲" : isRisk ? "▼" : "·";
        return (
          <div key={j} style={{ display: "flex", gap: 8, fontSize: 13, lineHeight: 1.6 }}>
            <span style={{ color, flexShrink: 0 }}>{dot}</span>
            <span style={{ color: "#cbd5e1" }}>
              <span style={{ color, fontWeight: 600 }}>{isStrength ? "Strength" : isRisk ? "Risk" : ""}</span>
              {(isStrength || isRisk) ? line.slice(line.indexOf(":") + 1) : line}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function InterpretationPanel({ analysis, aspect, interpretation, loading, error }) {
  const sections = interpretation ? parseInterpretation(interpretation) : [];
  const title = aspect ? `${ASPECT_EMOJI[aspect]} ${aspect} Reading` : "☯ General Reading";

  return (
    <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 24 }}>
      {/* Header: title + score badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", letterSpacing: "0.02em" }}>{title}</div>
          <div style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace", marginTop: 2 }}>
            {analysis.input} · {analysis.pairs.length} pairs
            {analysis.combinations?.length > 0 && ` · ${analysis.combinations.length} combos`}
          </div>
        </div>
        <ScoreBadge analysis={analysis} />
      </div>

      {/* Loading skeleton */}
      {loading && sections.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[160, 100, 90, 70].map((w, j) => (
            <div key={j} style={{ height: j === 0 ? 12 : 10, width: `${w}%`, background: "#1e293b", borderRadius: 4 }} />
          ))}
        </div>
      )}

      {/* Sections */}
      {sections.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {sections.map((s, i) => {
            const isSR = s.title.toUpperCase().includes("STRENGTH") || s.title.toUpperCase().includes("RISK");
            return (
              <div key={i}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 16 }}>{iconFor(s.title)}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94a3b8" }}>{s.title}</span>
                </div>
                <div style={{ paddingLeft: 24 }}>
                  {isSR
                    ? <StrengthsRisks content={s.content} />
                    : <div style={{ fontSize: 14, lineHeight: 1.8, color: "#cbd5e1" }}>{s.content}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {error && <div style={{ color: "#dc2626", fontSize: 13, marginTop: 16 }}>{error}</div>}
    </div>
  );
}

// ─── COMBINATIONS ─────────────────────────────────────────────────────────────

function CombinationsPanel({ combinations }) {
  if (!combinations || combinations.length === 0) return null;
  return (
    <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b", marginBottom: 14 }}>
        Combinations Detected
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {combinations.map((c, i) => {
          const style = COMBO_KIND_COLORS[c.kind] || COMBO_KIND_COLORS.remedy;
          const pairRef = c.range[0] === c.range[1] ? `pair ${c.range[0] + 1}` : `pairs ${c.range[0] + 1}–${c.range[1] + 1}`;
          return (
            <div key={i} style={{ background: style.bg, border: `1px solid ${style.border}`, borderRadius: 8, padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 4, background: style.border, color: style.text, fontWeight: 700 }}>{style.badge}</span>
                <span style={{ fontSize: 13, color: "#e2e8f0" }}>{c.label}</span>
              </div>
              <span style={{ fontSize: 11, color: "#64748b", flexShrink: 0 }}>{pairRef}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── JOURNEY FLOW ─────────────────────────────────────────────────────────────

function JourneyNode({ pair, index, isSelected, onClick }) {
  const isAusp = AUSPICIOUS.includes(pair.category);
  const isInaup = INAUSPICIOUS.includes(pair.category);
  const color = isAusp ? "#16a34a" : isInaup ? "#dc2626" : "#475569";
  const size = nodeSize(pair.intensity || 1);
  const score = pair.adjustedPairScore ?? pair.pairScore ?? 50;
  const remedyBadge = pair.remediedBy ? "⛨" : pair.unremedied ? "⚠" : null;
  const remedyColor = pair.remediedBy ? "#16a34a" : "#dc2626";

  return (
    <div onClick={() => onClick(index)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", position: "relative" }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        border: `2px solid ${isSelected ? "#f59e0b" : color}`,
        background: isSelected ? `${color}30` : `${color}15`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        boxShadow: isSelected ? `0 0 0 3px #f59e0b40` : "none", transition: "all 0.15s", flexShrink: 0,
      }}>
        <span style={{ fontSize: Math.max(8, size * 0.22), fontWeight: 700, color, lineHeight: 1 }}>{pair.category}</span>
        <span style={{ fontSize: Math.max(7, size * 0.18), color: "#64748b", lineHeight: 1 }}>{score}</span>
      </div>
      <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", textAlign: "center" }}>{pair.originalDigits.join("")}</div>
      {remedyBadge && (
        <div style={{ position: "absolute", top: -4, right: -4, fontSize: 10, color: remedyColor, lineHeight: 1 }}>{remedyBadge}</div>
      )}
    </div>
  );
}

function JourneyConnector({ pair }) {
  const glyph = transitionGlyph(pair.transitionType);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, paddingBottom: 24, flexShrink: 0 }}>
      <div style={{ width: 20, height: 1, background: "#1e293b" }} />
      <span style={{ fontSize: 12, color: glyph.color || "#475569" }}>{glyph.glyph}</span>
    </div>
  );
}

function JourneyFlow({ pairs, selectedPairIdx, onSelectPair, isMobile }) {
  if (!pairs || pairs.length === 0) return null;

  return (
    <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b", marginBottom: 12 }}>
        Energy Journey <span style={{ color: "#334155", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— click pair to inspect</span>
      </div>
      <div style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "flex-start" : "flex-end",
        overflowX: isMobile ? "visible" : "auto",
        padding: "8px 4px 4px",
      }}>
        {pairs.map((p, i) => (
          <div key={i} style={{ display: "flex", flexDirection: isMobile ? "row" : "column", alignItems: "center" }}>
            <JourneyNode pair={p} index={i} isSelected={selectedPairIdx === i} onClick={onSelectPair} />
            {i < pairs.length - 1 && (isMobile
              ? <div style={{ width: 1, height: 16, background: "#1e293b", margin: "4px 0 4px 17px" }} />
              : <JourneyConnector pair={pairs[i + 1]} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PAIR DEEP DIVE ───────────────────────────────────────────────────────────

function PairRow({ pair, isSelected, onClick, index }) {
  const isAusp = AUSPICIOUS.includes(pair.category);
  const isInaup = INAUSPICIOUS.includes(pair.category);
  const color = isAusp ? "#16a34a" : isInaup ? "#dc2626" : "#475569";
  const score = pair.adjustedPairScore ?? pair.pairScore ?? 50;
  const scoreColor = score >= 75 ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626";
  const meta = CATEGORY_META[pair.category];

  return (
    <div onClick={() => onClick(index)} style={{
      background: isSelected ? `${color}12` : `${color}06`,
      border: `1px solid ${isSelected ? color : color + "25"}`,
      borderRadius: 8, padding: "10px 14px", cursor: "pointer", transition: "all 0.15s",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "monospace", fontSize: 13, color: "#94a3b8" }}>{pair.originalDigits.join("")}</span>
          <span style={{ color: "#334155" }}>→</span>
          <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color }}>{pair.resolvedPair}</span>
          {meta && <>
            <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 4, background: `${color}20`, color }}>{isAusp ? "吉" : "凶"}</span>
            <span style={{ fontSize: 13, color: "#e2e8f0" }}>{pair.category}</span>
            <span style={{ fontSize: 11, color: "#64748b" }}>{meta.subtitle}/{meta.subtitleEn}</span>
          </>}
          {pair.remediedBy && <span style={{ fontSize: 10, color: "#16a34a" }}>⛨制化</span>}
          {pair.unremedied && <span style={{ fontSize: 10, color: "#dc2626" }}>⚠未化</span>}
          {pair.category === "伏位" && pair.activated === false && <span style={{ fontSize: 10, color: "#64748b" }}>◼休眠</span>}
          {pair.category === "伏位" && pair.activated === true && <span style={{ fontSize: 10, color: "#0d9488" }}>◆啟動</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {pair.intensity && <span style={{ fontSize: 11, color: "#64748b" }}>i{pair.intensity}</span>}
          <span style={{ fontSize: 16, fontWeight: 700, color: scoreColor, fontFamily: "monospace" }}>{score}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#64748b" }}>
        <span>{pair.narrativeRole}</span>
        {pair.transitionType && pair.transitionType !== "opening" && (
          <span style={{ color: isAusp ? "#16a34a" : isInaup ? "#dc2626" : "#94a3b8" }}>{transitionGlyph(pair.transitionType).label}</span>
        )}
        {pair.modifier && pair.modifier !== "fuwei" && <span style={{ color: pair.modifier === "hidden" ? "#475569" : "#d97706" }}>· {pair.modifier}</span>}
      </div>

      {isSelected && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1e293b" }}>
          {CATEGORY_SEEDS_V2[pair.category] && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: "#16a34a" }}><span style={{ color: "#64748b" }}>Light: </span>{CATEGORY_SEEDS_V2[pair.category].light}</div>
              <div style={{ fontSize: 12, color: "#dc2626" }}><span style={{ color: "#64748b" }}>Shadow: </span>{CATEGORY_SEEDS_V2[pair.category].shadow}</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}><span style={{ color: "#64748b" }}>Domains: </span>{CATEGORY_SEEDS_V2[pair.category].domains.join("、")}</div>
            </div>
          )}
          {pair.scoreReasons && pair.scoreReasons.length > 0 && (
            <div style={{ fontSize: 11, color: "#64748b" }}>Score modifiers: <span style={{ color: "#94a3b8" }}>{pair.scoreReasons.join(" · ")}</span></div>
          )}
        </div>
      )}
    </div>
  );
}

function PairDeepDive({ pairs, selectedPairIdx, onSelectPair }) {
  if (!pairs || pairs.length === 0) return (
    <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b", marginBottom: 14 }}>Pair Breakdown</div>
      <div style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No pairs to display</div>
    </div>
  );
  return (
    <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b", marginBottom: 14 }}>
        Pair Breakdown <span style={{ color: "#334155", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— click to expand</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {pairs.map((p, i) => (
          <PairRow key={i} pair={p} index={i} isSelected={selectedPairIdx === i} onClick={onSelectPair} />
        ))}
      </div>
    </div>
  );
}

// ─── ENERGY PROFILE ───────────────────────────────────────────────────────────

function EnergyProfile({ categoryTotals }) {
  const rows = energyRows(categoryTotals);
  if (rows.length === 0) return null;
  return (
    <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b", marginBottom: 14 }}>Energy Profile</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.map(r => {
          const color = r.isAusp ? "#16a34a" : "#dc2626";
          const seed = CATEGORY_SEEDS_V2[r.category];
          return (
            <div key={r.category}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, color, fontWeight: 600 }}>{r.category}</span>
                  <span style={{ fontSize: 11, color: "#64748b" }}>{r.subtitle} · {r.pct}%</span>
                </div>
                <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>intensity {r.total}</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: "#1e293b", overflow: "hidden", marginBottom: 4 }}>
                <div style={{ height: "100%", borderRadius: 2, background: color, width: `${r.pct}%`, transition: "width 0.4s" }} />
              </div>
              {seed && <div style={{ fontSize: 11, color: "#475569", paddingLeft: 2 }}>{r.isAusp ? seed.light : seed.shadow}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SCORE RATIONALE ──────────────────────────────────────────────────────────

function ScoreRationale({ pairs, combinations, finalScore }) {
  const modifiedPairs = pairs.filter(p => p.scoreReasons && p.scoreReasons.length > 0);
  const seqBonuses = combinations.filter(c => c.type === "生天延" || c.type === "吉星疊加");
  if (modifiedPairs.length === 0 && seqBonuses.length === 0) return null;
  return (
    <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b", marginBottom: 14 }}>Score Rationale</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {modifiedPairs.map((p, i) => {
          const color = AUSPICIOUS.includes(p.category) ? "#16a34a" : "#dc2626";
          const score = p.adjustedPairScore ?? p.pairScore;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "monospace", color }}>{p.category}</span>
                <span style={{ color: "#475569" }}>{p.scoreReasons.join(" · ")}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#475569", textDecoration: "line-through", fontFamily: "monospace" }}>{p.pairScore}</span>
                <span style={{ color: "#94a3b8" }}>→</span>
                <span style={{ color: "#e2e8f0", fontWeight: 600, fontFamily: "monospace" }}>{score}</span>
              </div>
            </div>
          );
        })}
        {seqBonuses.length > 0 && (
          <div style={{ paddingTop: 6, borderTop: "1px solid #1e293b", fontSize: 12, color: "#0d9488" }}>
            Sequence bonus +{seqBonuses.length * 3} pts ({seqBonuses.map(c => c.type).join(", ")}) → final {finalScore}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── RADAR ────────────────────────────────────────────────────────────────────

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
                <div style={{ width: 12, height: 3, background: color, borderRadius: 2 }} />{label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── BREAKDOWN (SECONDARY, COLLAPSIBLE) ───────────────────────────────────────

function Breakdown({ analysis, selectedPairIdx, onSelectPair, isMobile }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12,
        color: "#94a3b8", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
        cursor: "pointer",
      }}>
        <span>📐 Analysis Breakdown</span>
        <span style={{ color: "#475569" }}>{open ? "▲ hide" : "▼ show"}</span>
      </button>
      {open && (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
          <CombinationsPanel combinations={analysis.combinations} />
          <JourneyFlow pairs={analysis.pairs} selectedPairIdx={selectedPairIdx} onSelectPair={onSelectPair} isMobile={isMobile} />
          <PairDeepDive pairs={analysis.pairs} selectedPairIdx={selectedPairIdx} onSelectPair={onSelectPair} />
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
            <EnergyProfile categoryTotals={analysis.categoryTotals} />
            <RadarPanel categoryTotals={analysis.categoryTotals} />
          </div>
          <ScoreRationale pairs={analysis.pairs} combinations={analysis.combinations || []} finalScore={analysis.finalScore} />
        </div>
      )}
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
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 24 }}>
        <label style={{ display: "block", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b", marginBottom: 8 }}>
          Enter numbers to compare — one per line
        </label>
        <div style={{ fontSize: 11, color: "#475569", marginBottom: 12 }}>Tip: use "Label: Number" format e.g. "Block A: 620B" for clearer results</div>
        <textarea
          value={inputText}
          onChange={e => { setInputText(e.target.value); setRanked(false); }}
          placeholder={"91234567\n98765432\nBlock A: 620B\nMy number: 1312"}
          rows={6}
          style={{ width: "100%", boxSizing: "border-box", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "12px 16px", fontSize: 14, color: "#f1f5f9", outline: "none", fontFamily: "monospace", resize: "vertical", letterSpacing: "0.05em", lineHeight: 1.8 }}
        />
        <button onClick={handleRank} disabled={!inputText.trim()} style={{
          marginTop: 12, width: "100%", padding: "13px 0", borderRadius: 8, border: "none",
          background: inputText.trim() ? "linear-gradient(135deg, #f59e0b, #d97706)" : "#1e293b",
          color: inputText.trim() ? "#0a0f1e" : "#475569",
          fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
          cursor: inputText.trim() ? "pointer" : "not-allowed",
        }}>Rank by Score</button>
      </div>

      {ranked && results.length > 0 && (
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b", marginBottom: 16 }}>Rankings — {results.length} numbers</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {results.map((r, i) => {
              const color = BAND_COLORS[r.scoreBand] || "#475569";
              const topCategories = Object.entries(r.categoryTotals).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
              return (
                <div key={i} style={{ background: "#0a0f1e", border: `1px solid ${color}30`, borderRadius: 10, padding: "14px 16px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${r.finalScore}%`, background: `${color}10`, transition: "width 0.5s ease" }} />
                  <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: 20, width: 32, textAlign: "center", flexShrink: 0 }}>{MEDAL[i] || <span style={{ fontSize: 13, color: "#475569", fontWeight: 700 }}>#{i + 1}</span>}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 4, fontFamily: "monospace" }}>{r.label}</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {r.pairs.map((p, j) => {
                          const isAusp = AUSPICIOUS.includes(p.category);
                          const isInaup = INAUSPICIOUS.includes(p.category);
                          const pColor = isAusp ? "#16a34a" : isInaup ? "#dc2626" : "#475569";
                          return (
                            <span key={j} style={{ fontSize: 11, padding: "1px 6px", borderRadius: 4, border: `1px solid ${pColor}40`, color: pColor, fontFamily: "monospace" }}>
                              {p.resolvedPair}{p.transitionType === "fuwei-amplify" ? "↑" : p.transitionType === "fuwei-deflate" ? "↓" : ""}
                            </span>
                          );
                        })}
                      </div>
                      {topCategories.length > 0 && <div style={{ marginTop: 4, fontSize: 11, color: "#64748b" }}>{topCategories.join(" · ")}</div>}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: "monospace", lineHeight: 1 }}>{r.finalScore}</div>
                      <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{r.scoreBand}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
  const isMobile = useIsMobile();
  const [mode, setMode] = useState("read");
  const [input, setInput] = useState("");
  const [aspect, setAspect] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [interpretation, setInterpretation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [provider, setProvider] = useState(null);
  const [selectedPairIdx, setSelectedPairIdx] = useState(null);

  const handleSelectPair = (idx) => setSelectedPairIdx(prev => prev === idx ? null : idx);

  // Run a reading for a given analysis + focus. aspect=null → general.
  const runReading = async (result, focus) => {
    setError(null);
    setInterpretation(null);
    setLoading(true);
    const prompt = focus ? buildAspectPrompt(result, focus) : buildBasePrompt(result);
    try {
      const { text, provider: p } = await callLLM(prompt);
      setInterpretation(text);
      setProvider(p);
    } catch (e) {
      setError(`Reading failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!input) return;
    setProvider(null);
    setSelectedPairIdx(null);
    const result = analyzeNumber(input);
    setAnalysis(result);
    await runReading(result, aspect);
  };

  // Switching focus re-reads the SAME number with the new focus (replace).
  const handleAspectChange = async (newAspect) => {
    setAspect(newAspect);
    if (!analysis || loading) return;
    setSelectedPairIdx(null);
    await runReading(analysis, newAspect);
  };

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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {provider && (
            <div style={{
              fontSize: 11, padding: "4px 10px", borderRadius: 20,
              background: provider.includes("qwen") ? "rgba(139,92,246,0.15)" : "rgba(245,158,11,0.15)",
              border: `1px solid ${provider.includes("qwen") ? "#7c3aed" : "#d97706"}`,
              color: provider.includes("qwen") ? "#a78bfa" : "#f59e0b", letterSpacing: "0.05em",
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
                fontSize: 13, fontWeight: mode === m ? 600 : 400, cursor: "pointer", transition: "all 0.15s",
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 24px" }}>
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
              loading={loading}
              hasAnalysis={!!analysis}
            />

            {analysis && (
              <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                {/* PRIMARY: prose reading */}
                <InterpretationPanel
                  analysis={analysis}
                  aspect={aspect}
                  interpretation={interpretation}
                  loading={loading}
                  error={error}
                />
                {/* SECONDARY: collapsible breakdown */}
                <Breakdown
                  analysis={analysis}
                  selectedPairIdx={selectedPairIdx}
                  onSelectPair={handleSelectPair}
                  isMobile={isMobile}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
