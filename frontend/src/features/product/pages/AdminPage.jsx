import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap/dist/gsap";
import {
  Package,
  Users,
  Bell,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  Loader2,
  PackageSearch,
  UploadCloud,
  Minus,
  LayoutDashboard,
} from "lucide-react";
import { useAuthHook } from "../../auth/hooks/useAuthHook";
import { useAdminHook } from "../hooks/useAdminHook";
import "../styles/admin.scss";

// ── Helper ────────────────────────────────────────────────────────────────────
function getInitials(name) {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
}

function getProcessingClass(level) {
  if (!level) return "minimal";
  const l = level.toLowerCase();
  if (l.includes("ultra")) return "ultra";
  if (l.includes("processed")) return "processed";
  if (l.includes("minimal")) return "minimal";
  return "unprocessed";
}

// ── Admin Tab Nav ─────────────────────────────────────────────────────────────
const ADMIN_TABS = [
  { icon: LayoutDashboard, label: "Dashboard", section: "dashboard" },
  { icon: Package, label: "Products", section: "products" },
  { icon: Users, label: "Users", section: "users" },
  { icon: Bell, label: "Requests", section: "requests" },
];

const AdminTabBar = ({ activeSection, onNav }) => (
  <div className="admin-tabbar">
    {ADMIN_TABS.map(({ icon: Icon, label, section }) => (
      <button
        key={section}
        className={`admin-tabbar__tab ${
          activeSection === section ? "admin-tabbar__tab--active" : ""
        }`}
        onClick={() => onNav(section)}
        id={`admin-tab-${section}`}
      >
        <Icon size={16} />
        <span>{label}</span>
      </button>
    ))}
  </div>
);

// ── DEFAULT NUTRIENT KEYS ─────────────────────────────────────────────────────
const DEFAULT_NUTRIENTS = [
  { key: "energy_kcal", value: "" },
  { key: "sugar", value: "" },
  { key: "fat", value: "" },
  { key: "saturated_fat", value: "" },
  { key: "sodium", value: "" },
  { key: "carbohydrates", value: "" },
  { key: "protein", value: "" },
];

// ── PRODUCT MODAL ─────────────────────────────────────────────────────────────
const ProductModal = ({ product, onClose, onSave }) => {
  const isEdit = Boolean(product?._id);
  const fileInputRef = useRef(null);

  // ── Basic fields
  const [name, setName] = useState(product?.name || "");
  const [brand, setBrand] = useState(product?.brand || "");
  const [barcode, setBarcode] = useState(product?.barcode || "");

  // ── Image
  const [imageFile, setImageFile] = useState(null); // File object
  const [imagePreview, setImagePreview] = useState(product?.imgUrl || null); // preview URL

  // ── Nutrients  (array of { key, value })
  const [nutrients, setNutrients] = useState(() => {
    if (product?.nutrients) {
      return Object.entries(product.nutrients).map(([k, v]) => ({
        key: k,
        value: String(v),
      }));
    }
    return DEFAULT_NUTRIENTS.map((n) => ({ ...n }));
  });

  // ── Additives  (array of { code })
  const [additives, setAdditives] = useState(() => {
    if (product?.additives?.length) {
      return product.additives
        .map((a) => {
          if (!a) return null;
          if (typeof a === "string") return { code: a };
          return { code: a.code || "" };
        })
        .filter((row) => row && row.code.trim());
    }
    return [];
  });

  // ── Rating fields
  const [ratingScore, setRatingScore] = useState(
    product?.rating?.totalScore != null
      ? String(product.rating.totalScore)
      : "",
  );
  const [ratingStars, setRatingStars] = useState(
    product?.rating?.stars != null ? String(product.rating.stars) : "",
  );
  const [ratingCategory, setRatingCategory] = useState(
    product?.rating?.category || "",
  );

  // ── Image handlers
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ── Nutrient handlers
  const handleNutrientChange = (index, field, val) => {
    setNutrients((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: val } : row)),
    );
  };
  const addNutrientRow = () =>
    setNutrients((prev) => [...prev, { key: "", value: "" }]);
  const removeNutrientRow = (index) =>
    setNutrients((prev) => prev.filter((_, i) => i !== index));

  // ── Additive handlers
  const handleAdditiveChange = (index, val) => {
    setAdditives((prev) =>
      prev.map((row, i) => (i === index ? { code: val } : row)),
    );
  };
  const addAdditiveRow = () => setAdditives((prev) => [...prev, { code: "" }]);
  const removeAdditiveRow = (index) =>
    setAdditives((prev) => prev.filter((_, i) => i !== index));

  // ── Submit — build FormData so image binary is included
  const handleSubmit = (e) => {
    e.preventDefault();

    // Convert nutrients array → object
    const nutrientsObj = {};
    nutrients.forEach(({ key, value }) => {
      if (key.trim()) nutrientsObj[key.trim()] = value.trim();
    });

    // Additives: only send the code strings
    const additivesCodes = additives
      .map((a) => String(a?.code || "").trim())
      .filter(Boolean);

    const ratingData = {
      totalScore: ratingScore.trim() !== "" ? Number(ratingScore.trim()) : null,
      stars: ratingStars.trim() !== "" ? Number(ratingStars.trim()) : null,
      category: ratingCategory.trim() || null,
    };

    const fd = new FormData();
    fd.append("name", name.trim());
    fd.append("brand", brand.trim());
    fd.append("barcode", barcode.trim());
    fd.append("nutrients", JSON.stringify(nutrientsObj));
    fd.append("additives", JSON.stringify(additivesCodes));
    fd.append("rating", JSON.stringify(ratingData));
    if (imageFile) fd.append("image", imageFile);

    onSave(isEdit ? { id: product._id, productData: fd } : fd);
    onClose();
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div
        className="admin-modal admin-modal--wide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal__header">
          <h3 className="admin-modal__title">
            {isEdit ? "Edit Product" : "Add Product"}
          </h3>
          <button className="admin-modal__close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-modal__body">
            {/* ── Image Upload ── */}
            <div className="admin-field">
              <label className="admin-field__label">Product Image</label>
              <div
                className="admin-image-upload"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="admin-image-upload__preview"
                  />
                ) : (
                  <div className="admin-image-upload__placeholder">
                    <UploadCloud size={28} />
                    <span>Click to upload image</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                id="pf-image"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
            </div>

            {/* ── Basic Info ── */}
            <div className="admin-modal__two-col">
              <div className="admin-field">
                <label className="admin-field__label" htmlFor="pf-name">
                  Product Name
                </label>
                <input
                  id="pf-name"
                  className="admin-field__input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Organic Kale Chips"
                  required
                />
              </div>
              <div className="admin-field">
                <label className="admin-field__label" htmlFor="pf-brand">
                  Brand
                </label>
                <input
                  id="pf-brand"
                  className="admin-field__input"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. GreenHarvest Co."
                />
              </div>
            </div>

            <div className="admin-field">
              <label className="admin-field__label" htmlFor="pf-barcode">
                Barcode
              </label>
              <input
                id="pf-barcode"
                className="admin-field__input"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="0123456789"
              />
            </div>

            <div className="admin-field">
              <label className="admin-field__label">Rating</label>
              <div className="admin-modal__two-col">
                <div className="admin-field">
                  <label
                    className="admin-field__label"
                    htmlFor="pf-rating-score"
                  >
                    Score (out of 100)
                  </label>
                  <input
                    id="pf-rating-score"
                    className="admin-field__input"
                    type="number"
                    min="0"
                    max="100"
                    value={ratingScore}
                    onChange={(e) => setRatingScore(e.target.value)}
                    placeholder="80"
                    required
                  />
                </div>
                <div className="admin-field">
                  <label
                    className="admin-field__label"
                    htmlFor="pf-rating-stars"
                  >
                    Stars (out of 5)
                  </label>
                  <input
                    id="pf-rating-stars"
                    className="admin-field__input"
                    type="number"
                    min="0"
                    max="5"
                    value={ratingStars}
                    onChange={(e) => setRatingStars(e.target.value)}
                    placeholder="4"
                    required
                  />
                </div>
              </div>
              <div className="admin-field">
                <label
                  className="admin-field__label"
                  htmlFor="pf-rating-category"
                >
                  Category
                </label>
                <select
                  id="pf-rating-category"
                  className="admin-field__select"
                  value={ratingCategory}
                  onChange={(e) => setRatingCategory(e.target.value)}
                  required
                >
                  <option value="">Select category</option>
                  <option value="poor">Poor</option>
                  <option value="good">Good</option>
                  <option value="best">Best</option>
                </select>
              </div>
            </div>

            {/* ── Nutrients ── */}
            <div className="admin-field">
              <div className="admin-field__section-header">
                <label className="admin-field__label">Nutrients</label>
                <button
                  type="button"
                  className="admin-btn admin-btn--add-row"
                  onClick={addNutrientRow}
                  id="add-nutrient-row-btn"
                >
                  <Plus size={13} /> Add Field
                </button>
              </div>
              <div className="admin-kv-list">
                {nutrients.map((row, i) => (
                  <div className="admin-kv-row" key={i}>
                    <input
                      className="admin-field__input admin-kv-row__key"
                      value={row.key}
                      onChange={(e) =>
                        handleNutrientChange(i, "key", e.target.value)
                      }
                      placeholder="e.g. sodium"
                      id={`nutrient-key-${i}`}
                    />
                    <span className="admin-kv-row__sep">:</span>
                    <input
                      className="admin-field__input admin-kv-row__val"
                      value={row.value}
                      onChange={(e) =>
                        handleNutrientChange(i, "value", e.target.value)
                      }
                      placeholder="e.g. 2g"
                      id={`nutrient-val-${i}`}
                    />
                    <button
                      type="button"
                      className="admin-btn admin-btn--remove-row"
                      onClick={() => removeNutrientRow(i)}
                      title="Remove row"
                    >
                      <Minus size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Additives ── */}
            <div className="admin-field">
              <div className="admin-field__section-header">
                <label className="admin-field__label">
                  Additives (codes only)
                </label>
                <button
                  type="button"
                  className="admin-btn admin-btn--add-row"
                  onClick={addAdditiveRow}
                  id="add-additive-row-btn"
                >
                  <Plus size={13} /> Add Code
                </button>
              </div>
              {additives.length === 0 && (
                <p className="admin-kv-list__empty">
                  No additives — click "Add Code" to add one.
                </p>
              )}
              <div className="admin-kv-list">
                {additives.map((row, i) => (
                  <div className="admin-kv-row" key={i}>
                    <input
                      className="admin-field__input"
                      value={row.code}
                      onChange={(e) => handleAdditiveChange(i, e.target.value)}
                      placeholder="e.g. E330"
                      id={`additive-code-${i}`}
                    />
                    <button
                      type="button"
                      className="admin-btn admin-btn--remove-row"
                      onClick={() => removeAdditiveRow(i)}
                      title="Remove"
                    >
                      <Minus size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Info note ── */}
            <p className="admin-modal__info-note">
              🤖 <strong>Processing level</strong> and <strong>rating</strong>{" "}
              are computed automatically by the server.
            </p>
          </div>
          {/* end body */}

          <div className="admin-modal__footer">
            <button
              type="button"
              className="admin-btn admin-btn--outline"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn--primary">
              {isEdit ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── USER MODAL ────────────────────────────────────────────────────────────────
const UserModal = ({ user, onClose, onSave }) => {
  const [form, setForm] = useState({
    username: user?.username || user?.name || "",
    email: user?.email || "",
    role: user?.role || "user",
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ id: user._id, userData: form });
    onClose();
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__header">
          <h3 className="admin-modal__title">Edit User</h3>
          <button className="admin-modal__close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="admin-modal__body">
            <div className="admin-field">
              <label className="admin-field__label" htmlFor="uf-username">
                Username
              </label>
              <input
                id="uf-username"
                className="admin-field__input"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Username"
              />
            </div>
            <div className="admin-field">
              <label className="admin-field__label" htmlFor="uf-email">
                Email
              </label>
              <input
                id="uf-email"
                className="admin-field__input"
                type="email"
                name="email"
                value={form.email}
                // onChange={handleChange}
                placeholder="email@example.com"
              />
            </div>
            <div className="admin-field">
              <label className="admin-field__label" htmlFor="uf-role">
                Role
              </label>
              <select
                id="uf-role"
                className="admin-field__select"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="user">User</option>
                {/* <option value="pro">Pro</option> */}
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="admin-modal__footer">
            <button
              type="button"
              className="admin-btn admin-btn--outline"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn--primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── CONFIRM MODAL ──────────────────────────────────────────────────────────────
const ConfirmModal = ({ title, desc, onConfirm, onClose }) => (
  <div className="admin-modal-backdrop" onClick={onClose}>
    <div
      className="admin-modal"
      style={{ maxWidth: 380 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="admin-modal__header">
        <h3 className="admin-modal__title">{title}</h3>
        <button className="admin-modal__close" onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <p
        style={{ fontSize: "0.875rem", color: "#475569", marginTop: "0.5rem" }}
      >
        {desc}
      </p>
      <div className="admin-modal__footer">
        <button className="admin-btn admin-btn--outline" onClick={onClose}>
          Cancel
        </button>
        <button
          className="admin-btn admin-btn--primary"
          style={{ background: "#dc2626" }}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </div>
  </div>
);

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
const AdminPage = () => {
  const pageRef = useRef(null);
  const { user } = useAuthHook();
  const {
    products,
    users,
    requests,
    loading,
    handleAddProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    handleUpdateUser,
    handleDeleteUser,
    handleApproveRequest,
    handleDismissRequest,
  } = useAdminHook();

  const [activeSection, setActiveSection] = useState("dashboard");
  const [productModal, setProductModal] = useState(null); // null | 'add' | product obj
  const [userModal, setUserModal] = useState(null); // null | user obj
  const [confirmModal, setConfirmModal] = useState(null); // null | { title, desc, onConfirm }

  useEffect(() => {
    if (!pageRef.current) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".admin-page__header", { y: 28, opacity: 0, duration: 0.8 })
        .from(
          ".admin-tabbar",
          { y: 20, opacity: 0, duration: 0.55 },
          "-=0.45",
        )
        .from(
          ".admin-stat-card",
          { y: 26, opacity: 0, stagger: 0.1, duration: 0.55 },
          "-=0.35",
        );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!pageRef.current) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    const cards = pageRef.current.querySelectorAll(
      ".admin-product-card, .admin-user-card",
    );
    const rows = pageRef.current.querySelectorAll(".admin-requests-table tbody tr");

    gsap.fromTo(
      cards,
      { y: 18, opacity: 0, scale: 0.985 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.55,
        stagger: 0.05,
        ease: "power2.out",
        overwrite: "auto",
      },
    );

    gsap.fromTo(
      rows,
      { y: 10, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.45,
        stagger: 0.035,
        ease: "power2.out",
        overwrite: "auto",
      },
    );
  }, [activeSection, products, users, requests, loading]);

  // ── Access guard ────────────────────────────────────────────────────────────
  if (user && user.role !== "admin") {
    return (
      <div className="admin-page">
        <div className="admin-denied">
          <div className="admin-denied__icon">🔒</div>
          <h1 className="admin-denied__title">Access Restricted</h1>
          <p className="admin-denied__desc">
            This area is for administrators only. Please contact your system
            administrator if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = [
    {
      label: "Total Products",
      value: products.length,
      iconVariant: "green",
      Icon: Package,
    },
    {
      label: "Registered Users",
      value: users.length - 1,
      iconVariant: "blue",
      Icon: Users,
    },
    {
      label: "Active Subscriptions",
      value: users.filter((u) => u.role === "pro").length,
      iconVariant: "slate",
      Icon: CheckCircle,
    },
    {
      label: "Requests",
      value: requests.length,
      iconVariant: "blue",
      Icon: Bell,
    },
  ];

  return (
    <div className="admin-page" ref={pageRef}>
      <div className="admin-page__content">
        {/* ── Header ── */}
        <div className="admin-page__header">
          <div>
            <h1 className="admin-page__title">Admin Dashboard</h1>
            <p className="admin-page__subtitle">
              Manage products, users and pending requests.
            </p>
          </div>
          <button
            className="admin-btn admin-btn--primary"
            id="admin-add-product-btn"
            onClick={() => setProductModal("add")}
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>

        {/* ── Tab bar ── */}
        <AdminTabBar activeSection={activeSection} onNav={setActiveSection} />

        {/* ── Banners ── */}
        {loading && (
          <div className="admin-banner admin-banner--loading">
            <Loader2 size={14} style={{ display: "inline", marginRight: 6 }} />
            Loading…
          </div>
        )}

        {/* ── Stats ── */}
        <div className="admin-page__stats">
          {stats.map(({ label, value, iconVariant, Icon }) => (
            <div className="admin-stat-card" key={label}>
              <div
                className={`admin-stat-card__icon admin-stat-card__icon--${iconVariant}`}
              >
                <Icon size={20} />
              </div>
              <div className="admin-stat-card__body">
                <p className="admin-stat-card__value">{value}</p>
                <p className="admin-stat-card__label">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ════════════════════ PRODUCTS SECTION ════════════════════════════ */}
        {(activeSection === "dashboard" || activeSection === "products") && (
          <section className="admin-section" id="admin-products-section">
            <div className="admin-section__header">
              <h2 className="admin-section__title">
                Products Database
                <span className="admin-section__count">{products.length}</span>
              </h2>
              <button
                className="admin-btn admin-btn--outline"
                onClick={() => setProductModal("add")}
              >
                <Plus size={14} /> Add Product
              </button>
            </div>

            {products.length === 0 && !loading ? (
              <div className="admin-empty">
                <PackageSearch size={40} />
                <p>No products in the database yet.</p>
              </div>
            ) : (
              <div className="admin-section__grid">
                {products.map((prod) => (
                  <div className="admin-product-card" key={prod._id}>
                    <div className="admin-product-card__image">
                      {prod.imgUrl ? (
                        <img src={prod.imgUrl} alt={prod.name} />
                      ) : (
                        <span className="admin-product-card__image--placeholder">
                          {prod.name?.[0] || "?"}
                        </span>
                      )}
                    </div>
                    <div className="admin-product-card__body">
                      {prod.fromRequest && (
                        <span className="admin-product-card__request-tag">
                          From Request
                        </span>
                      )}
                      <p className="admin-product-card__name">
                        {prod.name || "—"}
                      </p>
                      <p className="admin-product-card__brand">
                        {prod.brand || "—"}
                      </p>
                      <div className="admin-product-card__meta">
                        <span
                          className={`admin-product-card__badge admin-product-card__badge--${getProcessingClass(prod.processingLevel)}`}
                        >
                          {prod.processingLevel || "Unknown"}
                        </span>
                        {prod.nutriscore && (
                          <span className="admin-product-card__score">
                            Score {prod.nutriscore}
                          </span>
                        )}
                      </div>
                      <div className="admin-product-card__actions">
                        <button
                          className="admin-btn admin-btn--edit"
                          id={`edit-product-${prod._id}`}
                          onClick={() => setProductModal(prod)}
                        >
                          <Pencil size={13} /> Edit
                        </button>
                        <button
                          className="admin-btn admin-btn--delete"
                          id={`delete-product-${prod._id}`}
                          onClick={() =>
                            setConfirmModal({
                              title: "Delete Product",
                              desc: `Permanently remove "${prod.name}" from the database?`,
                              onConfirm: () =>
                                handleDeleteProduct({ id: prod._id }),
                            })
                          }
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ════════════════════ USERS SECTION ═══════════════════════════════ */}
        {(activeSection === "dashboard" || activeSection === "users") && (
          <section className="admin-section" id="admin-users-section">
            <div className="admin-section__header">
              <h2 className="admin-section__title">
                Registered Users
                <span className="admin-section__count">{users.length - 1}</span>
              </h2>
            </div>

            {users.length === 0 && !loading ? (
              <div className="admin-empty">
                <Users size={40} />
                <p>No users found.</p>
              </div>
            ) : (
              <div className="admin-section__grid">
                {users?.map((u) =>
                  u.role == "user" ? (
                    <div className="admin-user-card" key={u._id}>
                      <div className="admin-user-card__top">
                        <div className="admin-user-card__avatar">
                          {getInitials(u.username || u.name)}
                        </div>
                        <div className="admin-user-card__info">
                          <p className="admin-user-card__name">
                            {u.username || u.name || "—"}
                          </p>
                          <p className="admin-user-card__email">
                            {u.email || "—"}
                          </p>
                        </div>
                      </div>
                      <div className="admin-user-card__meta">
                        <span
                          className={`admin-user-card__role admin-user-card__role--${u.role || "user"}`}
                        >
                          {u.role || "User"}
                        </span>
                        <span className="admin-user-card__joined">
                          Joined {formatDate(u.createdAt)}
                        </span>
                      </div>
                      <div className="admin-user-card__actions">
                        <button
                          className="admin-btn admin-btn--edit"
                          id={`edit-user-${u._id}`}
                          onClick={() => setUserModal(u)}
                        >
                          <Pencil size={13} /> Edit
                        </button>
                        <button
                          className="admin-btn admin-btn--delete"
                          id={`delete-user-${u._id}`}
                          onClick={() =>
                            setConfirmModal({
                              title: "Delete User",
                              desc: `Permanently remove "${u.username || u.email}" from the system?`,
                              onConfirm: () => handleDeleteUser({ id: u._id }),
                            })
                          }
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ) : null,
                )}
              </div>
            )}
          </section>
        )}

        {/* ════════════════════ REQUESTS SECTION ════════════════════════════ */}
        {(activeSection === "dashboard" || activeSection === "requests") && (
          <section className="admin-section" id="admin-requests-section">
            <div className="admin-section__header">
              <h2 className="admin-section__title">
                Pending Requests
                <span className="admin-section__count">{requests.length}</span>
              </h2>
            </div>

            {requests.length === 0 && !loading ? (
              <div className="admin-empty">
                <CheckCircle size={40} />
                <p>No pending requests — all clear!</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="admin-requests-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Requested By</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req._id}>
                        <td className="admin-requests-table__product-name">
                          {req.productName || req.name || "—"}
                        </td>
                        <td className="admin-requests-table__requester">
                          {req.requestedBy?.username || req.requestedBy || "—"}
                        </td>
                        <td className="admin-requests-table__date">
                          {formatDate(req.createdAt)}
                        </td>
                        <td>
                          <span className="admin-requests-table__status admin-requests-table__status--pending">
                            Pending
                          </span>
                        </td>
                        <td>
                          <div className="admin-requests-table__actions">
                            <button
                              className="admin-btn admin-btn--approve"
                              id={`approve-request-${req._id}`}
                              onClick={() =>
                                handleApproveRequest({ id: req._id })
                              }
                            >
                              <CheckCircle size={13} /> Resolved
                            </button>
                            <button
                              className="admin-btn admin-btn--dismiss"
                              id={`dismiss-request-${req._id}`}
                              onClick={() =>
                                handleDismissRequest({ id: req._id })
                              }
                            >
                              <XCircle size={13} /> Clear
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>

      {/* ── Modals ── */}
      {productModal && (
        <ProductModal
          product={productModal === "add" ? null : productModal}
          onClose={() => setProductModal(null)}
          onSave={
            productModal === "add" ? handleAddProduct : handleUpdateProduct
          }
        />
      )}

      {userModal && (
        <UserModal
          user={userModal}
          onClose={() => setUserModal(null)}
          onSave={handleUpdateUser}
        />
      )}

      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          desc={confirmModal.desc}
          onConfirm={confirmModal.onConfirm}
          onClose={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
};

export default AdminPage;
