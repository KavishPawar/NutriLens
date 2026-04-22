import React from "react";
import { Star } from "lucide-react";
import { useProductHook } from "../hooks/useProductHook";
import "../styles/history.scss/index.scss";
import { useNavigate } from "react-router";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Get up to 2 uppercase initials from a product name */
// const getInitials = (name = "") =>
//   name
//     .split(" ")
//     .filter(Boolean)
//     .slice(0, 2)
//     .map((w) => w[0].toUpperCase())
//     .join("");

/**
 * Maps the processingLevel string from the DB to a CSS class.
 * Handles null / undefined gracefully.
 */
const getLevelClass = (level) => {
  if (!level) return "unknown";
  const normalised = level.toLowerCase().replace(/\s+/g, "-");
  // Known classes: ultra-processed | processed | minimally-processed
  const known = ["ultra-processed", "processed", "minimally-processed"];
  return known.includes(normalised) ? normalised : "unknown";
};

/** Human-readable label for the processing level */
const getLevelLabel = (level) => {
  if (!level) return "Unknown";
  return level
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

// ── Sub-component: single card ────────────────────────────────────────────────
const ProductCard = ({ product, searchProduct }) => {
  const { imgUrl, name=null, barcode, brand=null, processingLevel, rating } = product;

  const levelClass = getLevelClass(processingLevel);
  const levelLabel = getLevelLabel(processingLevel);
  // const initials   = getInitials(name);

  return (
    <div className="product-card" onClick={() => searchProduct( barcode )}>
      {/* ── Image / placeholder ─────────────────────────────────────────── */}
      {imgUrl ? (
        <img className="card-image" src={imgUrl} alt={name} />
      ) : (
        <div className="card-image-placeholder">
          <span className="placeholder-initials">{brand}</span>
        </div>
      )}

      {/* ── Name + Brand ────────────────────────────────────────────────── */}
      <div className="card-body">
        <span className="card-name">{name || "Unknown Product"}</span>
        {brand && <span className="card-brand">{brand}</span>}
      </div>

      {/* ── Footer: processing level (left) + rating (right) ────────────── */}
      <div className="card-footer">
        <span className={`badge-level ${levelClass}`}>{levelLabel}</span>

        <span className="card-rating">
          <Star
            size={13}
            className="star-icon"
            fill="#f59e0b"
            strokeWidth={0}
          />
          {rating?.stars != null ? rating.stars : "—"}
        </span>
      </div>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
const ProductHistory = () => {
  const { productHistory, loading, handleProductFetch } = useProductHook();
  const navigate = useNavigate();
  
  const searchProduct = async ( barcode ) => {
    await handleProductFetch({ barcode });
    console.log("FETCH DONE");
    navigate("/product-detail");
  }
  
  return (
    <div className="history-page">
      {/* Page header */}
      <div className="history-header">
        <h1>Scan History</h1>
        <p>Your curated journey through nutritional transparency.</p>
      </div>

      {/* States: loading → empty → grid */}
      {loading ? (
        <p className="history-state">Loading your history…</p>
      ) : !productHistory || productHistory.length === 0 ? (
        <p className="history-state">No products scanned yet.</p>
      ) : (
        <div className="history-grid">
          {productHistory.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              searchProduct={searchProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductHistory;
