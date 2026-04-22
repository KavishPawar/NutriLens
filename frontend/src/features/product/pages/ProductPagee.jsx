import React, { useState } from 'react'
import { Star, Bookmark, AlertTriangle, Info, CheckCircle } from 'lucide-react'
import { useProductHook } from '../hooks/useProductHook.jsx'
import '../styles/product-page.scss'

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  /** Daily reference values (per day) used for progress bar width */
  const DAILY = { energy_kcal: 2000, fat: 78, carbohydrates: 275, protein: 50, sodium: 2.3 }
  const toPct = (val, key) =>
    Math.min(100, Math.round(((val ?? 0) / (DAILY[key] ?? 1)) * 100))

  /** Derive a short human-readable category from the purpose string */
  const getAdditiveCategory = (purpose = '') => {
    const p = purpose.toLowerCase()
    if (p.includes('colour') || p.includes('color'))   return 'Coloring Agent'
    if (p.includes('flavour') || p.includes('flavor')) return 'Flavor Enhancer'
    if (p.includes('emulsif'))                          return 'Emulsifier & Stabilizer'
    if (p.includes('thicken'))                          return 'Thickening Agent'
    if (p.includes('raising') || p.includes('leaven')) return 'Raising Agent'
    if (p.includes('acidity') || p.includes('preserv')) return 'Acidity Regulator'
    if (p.includes('stabiliz') || p.includes('stabilis')) return 'Stabilizer'
    return 'Food Additive'
  }

  /** Risk level decides badge/icon colour */
  const HIGH_RISK = new Set(['E635', 'E451', 'E621', 'E320', 'E321', 'E102', 'E110', 'E122', 'E124'])
  const LOW_RISK  = new Set(['E330', 'E500', 'E501', 'E300', 'E301', 'E412', 'E160a', 'E200'])
  const getAdditiveRisk = (code) => {
    if (HIGH_RISK.has(code)) return 'high'
    if (LOW_RISK.has(code))  return 'low'
    return 'medium'
  }

  /** CSS modifier that matches the rating.category string */
  const getRatingMod = (category = '') => {
    const c = category.toLowerCase()
    if (c === 'excellent') return 'excellent'
    if (c === 'good')      return 'good'
    if (c === 'fair')      return 'fair'
    return 'poor'
  }

  /** Generate a short insight paragraph from product data */
  const generateInsight = (product) => {
    if (!product) return ''
    const { name, processing_level, nutrients_per_100g: n = {}, additives = [] } = product
    const level = processing_level?.value || 'unknown'
    const sodiumPct = toPct(n.sodium, 'sodium')
    const highAdditives = (additives || [])
      .filter(a => a && getAdditiveRisk(a.code) === 'high')
      .map(a => a.code)

    let text = `${name || 'This product'} falls into the ${level} category. `
    text += `While the sugar content is minimal, the high levels of saturated fats and sodium `
    text += `(${sodiumPct}% of daily value per 100g) `
    if (highAdditives.length) {
      text += `combined with the flavor enhancer${highAdditives.length > 1 ? 's' : ''} `
      text += `${highAdditives.join(', ')} suggest this should be consumed occasionally.`
    } else {
      text += `suggest mindful consumption.`
    }
    return text
  }

  // ─── Sub-components ───────────────────────────────────────────────────────────

  /** Row of ★ stars */
  const StarRow = ({ count, max = 5 }) => (
    <div className="pp-stars">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={18}
          fill={i < count ? '#f59e0b' : 'none'}
          stroke={i < count ? '#f59e0b' : '#d1d5db'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  )

  /**
   * Single nutrient card.
   * @param {string}  label       — uppercase label e.g. "ENERGY"
   * @param {number}  value       — numeric value
   * @param {string}  unit        — "kcal" | "g"
   * @param {string}  [note]      — sub-line text
   * @param {string}  [noteClass] — "note-danger" | "note-success"
   * @param {string}  [progressKey] — key in DAILY to compute bar width
   * @param {string}  [progressColor]
   * @param {boolean} [danger]    — adds a red left-border accent
   */
  const NutrientCard = ({ label, value, unit, note, noteClass, progressKey, progressColor, danger }) => (
    <div className={`pp-nutrient-card${danger ? ' pp-nutrient-card--danger' : ''}`}>
      <span className="pp-nutrient-label">{label}</span>
      <div className="pp-nutrient-value-row">
        <span className="pp-nutrient-value">{value}</span>
        <span className="pp-nutrient-unit">{unit}</span>
      </div>
      {note && (
        <span className={`pp-nutrient-note ${noteClass || ''}`}>{note}</span>
      )}
      {progressKey && (
        <div className="pp-progress-track">
          <div
            className="pp-progress-fill"
            style={{
              width: `${toPct(value, progressKey)}%`,
              backgroundColor: progressColor ?? '#0f172a',
            }}
          />
        </div>
      )}
    </div>
  )

  /**
   * Single additive chip — shows code badge, name, category, risk icon.
   * Clicking it toggles a dropdown with full name + purpose description.
   */
  const AdditiveChip = ({ additive }) => {
    const [open, setOpen] = useState(false)
    const { code, name, purpose } = additive
    const risk     = getAdditiveRisk(code)
    const category = getAdditiveCategory(purpose ?? '')
    const Icon     = risk === 'high' ? AlertTriangle : risk === 'low' ? CheckCircle : Info

    return (
      <div
        className={`pp-additive risk-${risk}${open ? ' expanded' : ''}`}
        onClick={() => setOpen(o => !o)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setOpen(o => !o)}
        aria-expanded={open}
      >
        <div className="pp-additive-row">
          <span className={`pp-additive-badge risk-${risk}`}>{code}</span>
          <div className="pp-additive-info">
            <span className="pp-additive-name">{name}</span>
            <span className="pp-additive-cat">{category}</span>
          </div>
          <Icon size={16} className={`pp-additive-icon risk-icon-${risk}`} />
        </div>

        {open && (
          <div className="pp-additive-dropdown">
            <p className="pp-dropdown-name">{name}</p>
            <p className="pp-dropdown-desc">{purpose}</p>
          </div>
        )}
      </div>
    )
  }

  // ─── Main component ───────────────────────────────────────────────────────────

const ProductPage = () => {
  const { product } = useProductHook()

  /* ── Empty state ── */
  if (!product) {
    return (
      <div className="product-page pp-empty">
        <p>No product loaded. Scan a barcode to view details.</p>
      </div>
    )
  }

  const {
    imgUrl,
    name,
    brand,
    processing_level,
    additives            = [],
    nutrients_per_100g   : n = {},
    rating               = {},
  } = product

  const processedAdditives = (additives || []).filter(Boolean)
  const processingVal      = processing_level?.value ?? 'unknown'
  const processingClass    = processingVal.toLowerCase().replace(/\s+/g, '-')
  const ratingMod          = getRatingMod(rating.category)
  const insight            = generateInsight(product)

  // Split insight so processing level can be highlighted inline
  const insightParts = insight.split(processingVal)

  return (
    <div className="product-page">
      {/* ══════════════ LEFT PANEL ══════════════ */}
      <aside className="pp-left">
        {/* Product image with processing badge */}
        <div className="pp-image-wrap">
          {imgUrl ? (
            <img src={imgUrl} alt={name} className="pp-product-img" />
          ) : (
            <div className="pp-image-placeholder">{name?.[0] ?? "?"}</div>
          )}
        </div>

        {/* Info card: name, brand, score, stars, category, CTA */}
        <div className="pp-info-card">
          <h1 className="pp-product-name">{name}</h1>
          {brand && <p className="pp-brand">BRAND: {brand.toUpperCase()}</p>}

          <p className={`pp-score rating-${ratingMod}`}>
            {rating.totalScore ?? "–"}
          </p>
          <StarRow count={rating.stars ?? 0} />
          <span className={`pp-rating-badge rating-${ratingMod}`}>
            Category: {rating.category ?? "–"}
          </span>

            <span className={`pp-processing-badge ${processingClass}`}>
              {processingVal}
            </span>
        </div>
      </aside>

      {/* ══════════════ RIGHT PANEL ══════════════ */}
      <section className="pp-right">
        {/* ── Nutritional Facts ─────────────────────── */}
        <div className="pp-section-header">
          <span className="pp-section-icon" aria-hidden>
            🥦
          </span>
          <h2 className="pp-section-title">Nutritional Facts</h2>
          <span className="pp-section-sub">(per 100g)</span>
        </div>

        <div className="pp-nutrients-grid">
          <NutrientCard
            label="ENERGY"
            value={n.energy_kcal}
            unit="kcal"
            progressKey="energy_kcal"
            progressColor="#0f172a"
          />
          <NutrientCard
            label="TOTAL FAT"
            value={n.fat}
            unit="g"
            note={`Sat. Fat: ${n.saturated_fat}g (High)`}
            noteClass="note-danger"
            progressKey="fat"
            progressColor="#0f172a"
          />
          <NutrientCard
            label="SODIUM"
            value={n.sodium != null ? parseFloat(n.sodium).toFixed(2) : "–"}
            unit="g"
            note="Excessive amount"
            noteClass="note-danger"
            danger
          />
          <NutrientCard
            label="TOTAL CARBS"
            value={n.carbohydrates}
            unit="g"
            note={`Sugars: ${n.sugars}g (Low)`}
            noteClass="note-success"
          />
          <NutrientCard
            label="PROTEIN"
            value={n.protein}
            unit="g"
            progressKey="protein"
            progressColor="#15803d"
          />
        </div>

        {/* ── Additives Analysis ────────────────────── */}
        <div className="pp-section-header pp-section-header--mt">
          <span className="pp-section-icon" aria-hidden>
            ⚠️
          </span>
          <h2 className="pp-section-title">Additives Analysis</h2>
        </div>

        {processedAdditives.length > 0 ? (
          <div className="pp-additives-grid">
            {processedAdditives.map((a) => (
              <AdditiveChip key={a.code} additive={a} />
            ))}
          </div>
        ) : (
          <p className="pp-no-additives">No additives detected.</p>
        )}

        {/* ── Curator's Insight ─────────────────────── */}
        {insight && (
          <div className="pp-insight-card">
            <h3 className="pp-insight-title">The Vital Curator's Insight</h3>
            <p className="pp-insight-text">
              {insightParts.map((part, i) => (
                <React.Fragment key={i}>
                  {part}
                  {i < insightParts.length - 1 && (
                    <strong className="pp-insight-highlight">
                      {processingVal}
                    </strong>
                  )}
                </React.Fragment>
              ))}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default ProductPage
