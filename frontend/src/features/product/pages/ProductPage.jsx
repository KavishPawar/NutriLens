import React, { useState, useEffect, useRef } from "react";
import { AlertTriangle, Info, CheckCircle, Bookmark, Star } from "lucide-react";
import { useProductHook } from "../hooks/useProductHook.jsx";

/* ─── helpers ─────────────────────────────────────────────── */
const ADDITIVE_RISK = {
  warning: {
    icon: <AlertTriangle size={14} />,
    color: "#e53e3e",
    bg: "#fff5f5",
    border: "#feb2b2",
  },
  info: {
    icon: <Info size={14} />,
    color: "#3182ce",
    bg: "#ebf8ff",
    border: "#bee3f8",
  },
  safe: {
    icon: <CheckCircle size={14} />,
    color: "#38a169",
    bg: "#f0fff4",
    border: "#9ae6b4",
  },
};

const PROCESSING_COLOR = {
  "ultra-processed": "#e53e3e",
  processed: "#dd6b20",
  "minimally-processed": "#38a169",
  unprocessed: "#276749",
};

/* Infer risk level from additive code heuristics */
function inferRisk(code = "") {
  const c = code.toUpperCase();
  const warnings = [
    "E635",
    "E621",
    "E631",
    "E627",
    "E951",
    "E950",
    "E452",
    "E451",
    "E450",
    "E338",
  ];
  const safe = [
    "E300",
    "E301",
    "E330",
    "E331",
    "E500",
    "E501",
    "E503",
    "E270",
    "E290",
    "E440",
  ];
  if (warnings.includes(c)) return "warning";
  if (safe.includes(c)) return "safe";
  return "info";
}

/* ─── sub-components ─────────────────────────────────────── */

function ProcessingBadge({ level }) {
  if (!level) return null;
  const color = PROCESSING_COLOR[level.toLowerCase()] || "#718096";
  return (
    <span
      style={{
        background: color,
        color: "#fff",
        fontSize: "0.7rem",
        fontWeight: 700,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        padding: "4px 12px",
        borderRadius: "999px",
        position: "absolute",
        top: 14,
        right: 14,
        boxShadow: `0 2px 8px ${color}55`,
      }}
    >
      {level}
    </span>
  );
}

function NutrientBar({ value, max, color = "#4a7c59", animated }) {
  const [width, setWidth] = useState(0);
  const pct = Math.min(100, Math.round((value / max) * 100));

  useEffect(() => {
    if (!animated) {
      setWidth(pct);
      return;
    }
    const t = setTimeout(() => setWidth(pct), 120);
    return () => clearTimeout(t);
  }, [pct, animated]);

  return (
    <div
      style={{
        background: "#edf2f7",
        borderRadius: 999,
        height: 5,
        marginTop: 6,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${width}%`,
          background: color,
          borderRadius: 999,
          transition: "width 0.9s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      />
    </div>
  );
}

const NUTRIENT_CONFIG = {
  energy_kcal: {
    label: "ENERGY",
    unit: "kcal",
    max: 900,
    color: "#4a7c59",
    display: (v) => `${v} kcal`,
  },
  fat: {
    label: "TOTAL FAT",
    unit: "g",
    max: 50,
    color: "#718096",
    display: (v) => `${v} g`,
  },
  sodium: {
    label: "SODIUM",
    unit: "g",
    max: 2.3,
    color: "#e53e3e",
    display: (v) => `${v} g`,
    warnAbove: 0.6,
  },
  carbohydrates: {
    label: "TOTAL CARBS",
    unit: "g",
    max: 100,
    color: "#4a7c59",
    display: (v) => `${v} g`,
  },
  protein: {
    label: "PROTEIN",
    unit: "g",
    max: 50,
    color: "#276749",
    display: (v) => `${v} g`,
  },
};

const SUB_NUTRIENT = {
  fat: { key: "saturated_fat", label: "Sat. Fat", warnAbove: 5 },
  carbohydrates: { key: "sugar", label: "Sugars", warnBelow: 5 },
};

function NutrientCard({
  nutrientKey,
  value,
  subValue,
  subKey,
  subLabel,
  animated,
}) {
  const cfg = NUTRIENT_CONFIG[nutrientKey];
  if (!cfg || value == null) return null;

  const isHigh = cfg.warnAbove != null && value > cfg.warnAbove;
  const valueColor = isHigh ? "#e53e3e" : "#1a202c";

  let subNote = null;
  if (SUB_NUTRIENT[nutrientKey] && subValue != null) {
    const sub = SUB_NUTRIENT[nutrientKey];
    const isWarn = sub.warnAbove != null && subValue > sub.warnAbove;
    const isLow = sub.warnBelow != null && subValue < sub.warnBelow;
    subNote = (
      <p
        style={{
          fontSize: "0.72rem",
          fontWeight: 600,
          color: isWarn ? "#e53e3e" : isLow ? "#38a169" : "#718096",
          marginTop: 4,
        }}
      >
        {sub.label}: {subValue}g{isWarn ? " (High)" : isLow ? " (Low)" : ""}
      </p>
    );
  }

  return (
    <div
      style={{
        background: "#fff",
        border: isHigh ? "1.5px solid #feb2b2" : "1.5px solid #e2e8f0",
        borderRadius: 12,
        padding: "16px 18px",
        flex: "1 1 180px",
        minWidth: 0,
      }}
    >
      <p
        style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          color: "#a0aec0",
          textTransform: "uppercase",
          marginBottom: 2,
        }}
      >
        {cfg.label}
      </p>
      <p style={{ fontSize: "1.4rem", fontWeight: 700, color: valueColor }}>
        {cfg.display(value)}
      </p>
      {isHigh && (
        <p
          style={{
            fontSize: "0.72rem",
            fontWeight: 600,
            color: "#e53e3e",
            marginTop: 2,
          }}
        >
          Excessive amount
        </p>
      )}
      {subNote}
      <NutrientBar
        value={value}
        max={cfg.max}
        color={isHigh ? "#e53e3e" : cfg.color}
        animated={animated}
      />
    </div>
  );
}

function AdditiveCard({ additive }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);
  const risk = inferRisk(additive.code);
  const theme = ADDITIVE_RISK[risk];

  useEffect(() => {
    if (contentRef.current) setContentHeight(contentRef.current.scrollHeight);
  }, []);

  return (
    <div
      onClick={() => setOpen((o) => !o)}
      style={{
        border: `1.5px solid ${open ? theme.border : "#e2e8f0"}`,
        borderRadius: 12,
        padding: "12px 14px",
        cursor: "pointer",
        background: open ? theme.bg : "#fff",
        transition: "background 0.2s, border-color 0.2s",
        userSelect: "none",
        minHeight: "4rem",
        alignSelf: "start",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            background: theme.bg,
            border: `1.5px solid ${theme.border}`,
            color: theme.color,
            fontSize: "0.68rem",
            fontWeight: 800,
            padding: "3px 8px",
            borderRadius: 6,
            whiteSpace: "nowrap",
            letterSpacing: "0.02em",
            flexShrink: 0,
          }}
        >
          {additive.code}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontWeight: 700,
              fontSize: "0.85rem",
              color: "#1a202c",
              margin: 0,
            }}
          >
            {additive.name}
          </p>
          {/* <p style={{ fontSize: "0.72rem", color: "#718096", margin: 0 }}>{additive.purpose}</p> */}
        </div>
        <span
          style={{
            color: theme.color,
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s ease",
          }}
        >
          {theme.icon}
        </span>
      </div>

      <div
        style={{
          overflow: "hidden",
          maxHeight: open ? `${contentHeight + 20}px` : "0px",
          transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div
          ref={contentRef}
          style={{
            paddingTop: 10,
            borderTop: `1px dashed ${theme.border}`,
            marginTop: 10,
          }}
        >
          <p
            style={{
              fontSize: "0.78rem",
              color: "#4a5568",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            <strong style={{ color: theme.color }}>{additive.code}</strong> —{" "}
            {additive.name} is used as a <em>{additive.purpose}</em>.
            {risk === "warning" &&
              " This additive has been flagged for potential health concerns; consume in moderation."}
            {risk === "safe" &&
              " This additive is generally recognised as safe (GRAS) by major food authorities."}
            {risk === "info" &&
              " More research is needed; it is considered safe in typical food quantities."}
          </p>
        </div>
      </div>
    </div>
  );
}

function StarRating({ stars, max = 5 }) {
  if (stars == null) return null;
  return (
    <div style={{ display: "flex", gap: 3, marginTop: 6 }}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={18}
          fill={i < Math.round(stars) ? "#f6ad55" : "none"}
          stroke={i < Math.round(stars) ? "#f6ad55" : "#cbd5e0"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

/* ─── main component ─────────────────────────────────────── */
export default function ProductPage() {
  const { product, aiResponse } = useProductHook();
  const [animated, setAnimated] = useState(false);
  const pageRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(t);
  }, [product]);

  if (!product) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
        }}
      >
        <p style={{ color: "#a0aec0", fontSize: "1rem" }}>
          No product data available.
        </p>
      </div>
    );
  }

  const {
    imgUrl,
    name,
    processingLevel,
    rating,
    nutrients = {},
    additives = [],
  } = product;

  const nutrientRows = [
    ["energy_kcal", null, null],
    ["fat", nutrients.saturated_fat, "saturated_fat"],
    ["sodium", null, null],
    ["carbohydrates", nutrients.sugar, "sugar"],
    ["protein", null, null],
  ];

  const hasAdditives = Array.isArray(additives) && additives.length > 0;

  const parsedAIResponse = (() => {
    if (!aiResponse) return null;
    if (typeof aiResponse === "object") return aiResponse;
    try {
      return JSON.parse(String(aiResponse).trim());
    } catch {
      return null;
    }
  })();

  const hasAIInsight = !!(
    parsedAIResponse?.advice ||
    parsedAIResponse?.intake ||
    (typeof aiResponse === "string" && aiResponse.trim())
  );

  // Build curator insight dynamically
  let insight = null;
  if (
    !hasAIInsight &&
    (processingLevel ||
      (nutrients.sodium && nutrients.sodium > 0.6) ||
      (nutrients.saturated_fat && nutrients.saturated_fat > 5))
  ) {
    const parts = [];
    if (processingLevel)
      parts.push(
        `This product falls into the <strong style="color:${PROCESSING_COLOR[processingLevel?.toLowerCase()] || "#e53e3e"}">${processingLevel}</strong> category.`,
      );
    if (nutrients.sugar != null && nutrients.sugar < 5)
      parts.push("The sugar content is minimal.");
    if (nutrients.saturated_fat != null && nutrients.saturated_fat > 5)
      parts.push("Saturated fat levels are elevated.");
    if (nutrients.sodium != null && nutrients.sodium > 0.6)
      parts.push("Sodium is high (nearly 50% of RDA per serving).");
    const warnAdditives = additives.filter(
      (a) => a?.code && inferRisk(a.code) === "warning",
    );
    if (warnAdditives.length)
      parts.push(
        `Flagged additives include ${warnAdditives.map((a) => a.code).join(", ")}.`,
      );
    insight = parts.join(" ");
  }

  return (
    <div
      ref={pageRef}
      style={{
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        background: "#f7f8fa",
        minHeight: "100vh",
        padding: "24px 16px",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          gap: 24,
          flexWrap: "wrap",
          alignItems: "flex-start",
        }}
      >
        {/* ── left panel ── */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1.5px solid #e2e8f0",
            padding: 24,
            flex: "0 0 260px",
            minWidth: 220,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          {processingLevel && <ProcessingBadge level={processingLevel} />}

          {imgUrl ? (
            <img
              src={imgUrl}
              alt={name || "Product"}
              style={{
                width: "100%",
                maxWidth: 200,
                objectFit: "contain",
                borderRadius: 10,
                marginTop: 8,
              }}
            />
          ) : (
            <div
              style={{
                width: 180,
                height: 180,
                background: "#edf2f7",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#a0aec0",
                fontSize: "0.8rem",
              }}
            >
              No image
            </div>
          )}

          {name && (
            <h2
              style={{
                margin: 0,
                fontSize: "1.4rem",
                fontWeight: 800,
                color: "#1a202c",
                textAlign: "center",
              }}
            >
              {name}
            </h2>
          )}

          {product.brand && (
            <p
              style={{
                margin: 0,
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#a0aec0",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Brand: {product.brand}
            </p>
          )}

          {rating?.totalScore != null && (
            <div style={{ textAlign: "center", marginTop: 4 }}>
              <p
                style={{
                  fontSize: "3rem",
                  fontWeight: 900,
                  color:
                    rating.totalScore >= 70
                      ? "#38a169"
                      : rating.totalScore >= 40
                        ? "#dd6b20"
                        : "#e53e3e",
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                {rating.totalScore}
              </p>
              <StarRating stars={rating.stars} />
              {rating.category && (
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 8,
                    background:
                      rating.totalScore >= 70
                        ? "#f0fff4"
                        : rating.totalScore >= 40
                          ? "#fffaf0"
                          : "#fff5f5",
                    color:
                      rating.totalScore >= 70
                        ? "#276749"
                        : rating.totalScore >= 40
                          ? "#c05621"
                          : "#c53030",
                    border: `1px solid ${rating.totalScore >= 70 ? "#9ae6b4" : rating.totalScore >= 40 ? "#fbd38d" : "#feb2b2"}`,
                    borderRadius: 999,
                    padding: "4px 14px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  Category: {rating.category}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── right panel ── */}
        <div
          style={{
            flex: "1 1 480px",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Nutritional Facts */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              border: "1.5px solid #e2e8f0",
              padding: "22px 22px 18px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 18,
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>🥦</span>
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  color: "#1a202c",
                }}
              >
                Nutritional Facts
              </h3>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#a0aec0",
                  fontWeight: 500,
                }}
              >
                (per 100g)
              </span>
            </div>

            <div
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              {nutrientRows.map(([key, subVal, subKey]) =>
                nutrients[key] != null ? (
                  <NutrientCard
                    key={key}
                    nutrientKey={key}
                    value={nutrients[key]}
                    subValue={subVal}
                    subKey={subKey}
                    animated={animated}
                  />
                ) : null,
              )}
            </div>
          </div>

          {/* Additives */}
          {hasAdditives && (
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                border: "1.5px solid #e2e8f0",
                padding: "22px 22px 18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>📌</span>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    color: "#1a202c",
                  }}
                >
                  Additives Analysis
                </h3>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: 12,
                  alignItems: "start",
                }}
              >
                {additives.map((a, i) =>
                  a?.code || a?.name ? (
                    <AdditiveCard key={i} additive={a} />
                  ) : null,
                )}
              </div>
            </div>
          )}

          {/* Curator's Insight */}
          {(hasAIInsight || insight) && (
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                border: "1.5px solid #e2e8f0",
                padding: "20px 22px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <span
                  style={{
                    width: 38,
                    height: 38,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "50%",
                    background: "#edf2ff",
                    color: "#2b6cb0",
                    fontSize: "1.1rem",
                  }}
                >
                  🔮
                </span>
                <div>
                  <h4
                    style={{
                      margin: 0,
                      fontSize: "0.95rem",
                      fontWeight: 800,
                      color: "#1a202c",
                    }}
                  >
                    Vital Curator's AI Lens
                  </h4>
                  <p
                    style={{
                      margin: "6px 0 0",
                      fontSize: "0.82rem",
                      color: "#718096",
                      lineHeight: 1.5,
                    }}
                  >
                    A personalised recommendation based on nutrition, additives,
                    and your goals.
                  </p>
                </div>
              </div>

              {hasAIInsight ? (
                <>
                  {parsedAIResponse?.advice ? (
                    <p
                      style={{
                        fontSize: "1rem",
                        color: "#2d3748",
                        lineHeight: 1.8,
                        margin: 0,
                        fontWeight: 700,
                      }}
                    >
                      “{parsedAIResponse.advice}”
                    </p>
                  ) : (
                    <p
                      style={{
                        fontSize: "0.95rem",
                        color: "#4a5568",
                        lineHeight: 1.75,
                        margin: 0,
                      }}
                    >
                      {String(aiResponse).trim()}
                    </p>
                  )}

                  {parsedAIResponse?.intake && (
                    <div
                      style={{
                        marginTop: 18,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 10,
                      }}
                    >
                      <span
                        style={{
                          background: "#f0f9ff",
                          border: "1px solid #bee3f8",
                          borderRadius: 999,
                          padding: "10px 14px",
                          color: "#2c5282",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                        }}
                      >
                        🥗 Suggested intake: {parsedAIResponse.intake}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <p
                  style={{
                    fontSize: "0.95rem",
                    color: "#4a5568",
                    lineHeight: 1.75,
                    margin: 0,
                  }}
                >
                  {insight ||
                    "The curator is analysing this product now. Refresh the page if the insight does not appear."}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* responsive overrides via inline style tag */}
      <style>{`
        @media (max-width: 640px) {
          /* left panel full width on mobile */
        }
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&display=swap');
      `}</style>
    </div>
  );
}
