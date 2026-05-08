import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  ShieldCheck,
  Droplets,
  Factory,
  Candy,
  Leaf,
  Sun,
  Moon,
  Trash2,
  LogOut,
  Heart,
  Camera,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Zap,
} from "lucide-react";
import { useAuthHook } from "../../auth/hooks/useAuthHook";
import { useNavigate } from "react-router";
import "../styles/profile.scss";
import { useProductHook } from "../hooks/useProductHook";

// ── Curator Goal definitions ─────────────────────────────────────────────────
const CURATOR_GOALS = [
  {
    id: "lower_sodium",
    icon: <Droplets size={18} />,
    label: "Less Salt",
    desc: "Flag high-salt items",
    concern: "less sodium",
  },
  {
    id: "avoid_ultra_processed",
    icon: <Factory size={18} />,
    label: "Less Processed Food",
    desc: "Prioritise whole foods",
    concern: "less processed food",
  },
  {
    id: "less_sugar",
    icon: <Candy size={18} />,
    label: "Less Sugar",
    desc: "Daily limit: 25g",
    concern: "less sugar",
  },
  {
    id: "less_additives",
    icon: <Leaf size={18} />,
    label: "Fewer Additives",
    desc: "Avoid artificial ingredients",
    concern: "less additives",
  },
  {
    id: "low_cholesterol",
    icon: <Heart size={18} />,
    label: "Low Cholesterol",
    desc: "Reduce unhealthy fats",
    concern: "less cholesterol",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getInitials(name) {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ── Component ─────────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { user, handleLogout, handleUpdateProfile } = useAuthHook();
  const { handleDeleteHistory } = useProductHook();

  // ── Local form state (mirrors user values) ─────────────────────────────────
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // ── Curator goals: set of active goal concerns ────────────────────────────
  const [goals, setGoals] = useState(new Set());

  // ── App Preferences ───────────────────────────────────────────────────────
  const [theme, setTheme] = useState("light"); // 'light' | 'dark'

  // ── Dirty-tracking: show save bar when anything changes ───────────────────
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // null | 'saved' | 'error'
  const saveTimerRef = useRef(null);

  // ── Seed form from user once loaded ───────────────────────────────────────
  const originalRef = useRef({
    fullName: "",
    email: "",
    goals: new Set(),
    theme: "light",
  });

  useEffect(() => {
    if (user) {
      const name = user.username || user.name || "";
      const mail = user.email || "";
      const initialGoals = Array.isArray(user.goals)
        ? new Set(user.goals)
        : new Set();
      const initialTheme = user.theme || "light";

      setFullName(name);
      setEmail(mail);
      setGoals(initialGoals);
      setTheme(initialTheme);
      originalRef.current = {
        fullName: name,
        email: mail,
        goals: new Set(initialGoals),
        theme: initialTheme,
      };
    }
  }, [user]);

  // ── Detect dirty state whenever anything changes ───────────────────────────
  useEffect(() => {
    const orig = originalRef.current;
    const goalsChanged =
      goals.size !== orig.goals.size ||
      [...goals].some((g) => !orig.goals.has(g));
    const dirty =
      fullName !== orig.fullName ||
      email !== orig.email ||
      goalsChanged ||
      theme !== orig.theme;
    setIsDirty(dirty);
    if (!dirty) setSaveStatus(null);
  }, [fullName, email, goals, theme]);

  // ── Toggle a curator goal ──────────────────────────────────────────────────
  const toggleGoal = (concern) => {
    setGoals((prev) => {
      const next = new Set(prev);
      next.has(concern) ? next.delete(concern) : next.add(concern);
      return next;
    });
  };

  const selectedGoals = CURATOR_GOALS.filter((goal) => goals.has(goal.concern));
  const availableGoals = CURATOR_GOALS.filter(
    (goal) => !goals.has(goal.concern),
  );

  // ── Save handler — persist profile changes via API ----------------------
  const handleSave = async () => {
    try {
      const updatedUser = await handleUpdateProfile({
        username: fullName,
        email,
        goals: [...goals],
        theme,
      });

      setSaveStatus("saved");
      originalRef.current = {
        fullName,
        email,
        goals: new Set(goals),
        theme,
      };
      setIsDirty(false);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setSaveStatus(null), 3000);

      if (updatedUser) {
        setFullName(updatedUser.username || fullName);
        setEmail(updatedUser.email || email);
        const refreshedGoals = Array.isArray(updatedUser.goals)
          ? new Set(updatedUser.goals)
          : new Set();
        setGoals(refreshedGoals);
        originalRef.current.goals = new Set(refreshedGoals);
      }
    } catch (err) {
      setSaveStatus("error");
      console.error("Profile update failed", err);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  // ── Cancel handler ─────────────────────────────────────────────────────────
  const handleCancel = () => {
    const orig = originalRef.current;
    setFullName(orig.fullName);
    setEmail(orig.email);
    setGoals(new Set(orig.goals));
    setTheme(orig.theme);
    setIsDirty(false);
    setSaveStatus(null);
  };

  // ── Logout handlers ──────────────────────────────────────────────────────
  const navigate = useNavigate();

  const handleLogoutUser = () => setShowLogoutModal(true);
  const confirmLogout = async () => {
    setShowLogoutModal(false);
    // TODO: clear auth tokens / call logout API
    await handleLogout();
    navigate("/login");
    console.log("Logging out…");
  };

  // ── Erase data stub ───────────────────────────────────────────────────────
  const handleEraseData = async () => {
    // TODO: confirmation modal + API call
    await handleDeleteHistory({ userId: user._id });
    console.log("Erasing data…");
  };

  const displayName = fullName || user?.username || user?.name || "Curator";

  return (
    <div className="profile-page">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="profile-page__header">
        <div>
          <h1 className="profile-page__title">Profile &amp; Settings</h1>
          <p className="profile-page__subtitle">
            Manage your nutritional preferences and account details.
          </p>
        </div>
        {saveStatus === "saved" && (
          <div className="profile-page__toast profile-page__toast--success">
            <CheckCircle2 size={15} />
            Changes saved successfully!
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1 — Account Identity
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="ps-section">
        <div className="ps-section__meta">
          <h2 className="ps-section__heading">Account Identity</h2>
          <p className="ps-section__desc">
            Update your public profile and contact information used for sync.
          </p>
        </div>

        <div className="ps-card ps-identity">
          {/* Avatar */}
          <div className="ps-identity__avatar-wrap">
            <div className="ps-identity__avatar">
              {user?.profilePic ? (
                <img src={user.profilePic} alt={displayName} />
              ) : (
                <span className="ps-identity__initials">
                  {getInitials(displayName)}
                </span>
              )}
            </div>
            <button
              className="ps-identity__avatar-edit"
              aria-label="Change photo"
            >
              <Camera size={13} />
            </button>
          </div>

          {/* Name + verified badge */}
          <div className="ps-identity__info">
            <p className="ps-identity__display-name">{displayName}</p>
            <p className="ps-identity__email-display">{user?.email || "—"}</p>
            <span className="ps-identity__badge">
              <ShieldCheck size={11} />
              Verified User
            </span>
          </div>

          {/* Editable fields */}
          <div className="ps-identity__fields">
            <div className="ps-field">
              <label className="ps-field__label" htmlFor="prof-name">
                <User size={12} />
                Full Name
              </label>
              <input
                id="prof-name"
                className="ps-field__input"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="ps-field">
              <label className="ps-field__label" htmlFor="prof-email">
                <Mail size={12} />
                Email Address
              </label>
              <input
                id="prof-email"
                className="ps-field__input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2 — Curator Goals (checkboxes)
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="ps-section">
        <div className="ps-section__meta">
          <h2 className="ps-section__heading">Curator Goals</h2>
          <p className="ps-section__desc">
            Customise how NutriLens analyses your scans based on your dietary
            priorities.
          </p>
        </div>

        <div className="ps-card ps-goals">
          <div className="ps-goals__selected-list">
            {selectedGoals.length > 0 ? (
              selectedGoals.map((goal) => (
                <button
                  key={goal.id}
                  type="button"
                  className="ps-goal-chip"
                  onClick={() => toggleGoal(goal.concern)}
                >
                  <span className="ps-goal-chip__icon">{goal.icon}</span>
                  <span className="ps-goal-chip__label">{goal.label}</span>
                  <span className="ps-goal-chip__remove">×</span>
                </button>
              ))
            ) : (
              <div className="ps-goals__empty">
                No goals selected yet. Pick a goal from the tray below.
              </div>
            )}
          </div>

          <div className="ps-goals__tray">
            {availableGoals.map((goal) => (
              <button
                key={goal.id}
                type="button"
                className="ps-goal-item"
                onClick={() => toggleGoal(goal.concern)}
              >
                <span className="ps-goal-item__icon">{goal.icon}</span>
                <span className="ps-goal-item__label">{goal.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 3 — App Preferences (theme only)
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="ps-section">
        <div className="ps-section__meta">
          <h2 className="ps-section__heading">App Preferences</h2>
          <p className="ps-section__desc">Interface and appearance settings.</p>
        </div>

        <div className="ps-card ps-prefs">
          <div className="ps-pref-row">
            <div className="ps-pref-row__info">
              <span className="ps-pref-row__icon-wrap">
                {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
              </span>
              <div>
                <p className="ps-pref-row__label">App Theme</p>
                <p className="ps-pref-row__desc">
                  {theme === "dark"
                    ? "Dark mode is active"
                    : "Light mode is active"}
                </p>
              </div>
            </div>
            <button
              className="ps-theme-flip-btn"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? <Sun size={14} /> : <Moon size={14} />}
              {theme === "light" ? "Light" : "Dark"}
              <span className="ps-theme-flip-btn__arrow">
                {theme === "light" ? <Moon size={12} /> : <Sun size={12} />}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 3b — Subscription
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="ps-section">
        <div className="ps-section__meta">
          <h2 className="ps-section__heading">Subscription</h2>
          <p className="ps-section__desc">
            Upgrade to Premium or Pro to unlock unlimited scans, AI insights and
            full scan history.
          </p>
        </div>

        <div className="ps-card ps-critical-card">
          <div className="ps-critical-card__info">
            <CreditCard
              size={18}
              className="ps-critical-card__icon"
              style={{ color: "#15803d" }}
            />
            <div>
              <p
                className="ps-critical-card__title"
                style={{ color: "#0f172a" }}
              >
                Manage Subscription
              </p>
              <p className="ps-critical-card__desc">
                View plans, upgrade, or manage your current NutriLens
                subscription.
              </p>
            </div>
          </div>
          <button
            id="profile-subscription-btn"
            className="ps-critical-card__btn"
            style={{
              background: "#15803d",
              color: "#fff",
              border: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
            }}
            onClick={() => navigate("/payment")}
          >
            <Zap size={14} />
            Upgrade Plan
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 4 — Critical Actions
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="ps-section">
        <div className="ps-section__meta">
          <h2 className="ps-section__heading ps-section__heading--danger">
            Critical Actions
          </h2>
          <p className="ps-section__desc">
            Data deletion and account termination settings.
          </p>
        </div>

        <div className="ps-critical-stack">
          {/* Erase Data */}
          <div className="ps-card ps-critical-card">
            <div className="ps-critical-card__info">
              <Trash2
                size={18}
                className="ps-critical-card__icon ps-critical-card__icon--red"
              />
              <div>
                <p className="ps-critical-card__title">
                  Delete NutriLens Account
                </p>
                <p className="ps-critical-card__desc">
                  This will permanently erase your scan history and nutritional
                  profile.
                </p>
              </div>
            </div>
            <button
              className="ps-critical-card__btn ps-critical-card__btn--red"
              onClick={handleEraseData}
            >
              Erase Data
            </button>
          </div>

          {/* Logout Account */}
          <div className="ps-card ps-critical-card ps-critical-card--logout">
            <div className="ps-critical-card__info">
              <LogOut
                size={18}
                className="ps-critical-card__icon ps-critical-card__icon--muted"
              />
              <div>
                <p className="ps-critical-card__title ps-critical-card__title--muted">
                  Logout Account
                </p>
                <p className="ps-critical-card__desc">
                  Sign out of your NutriLens session on this device.
                </p>
              </div>
            </div>
            <button
              className="ps-critical-card__btn ps-critical-card__btn--outline"
              onClick={handleLogoutUser}
            >
              Logout
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer version ─────────────────────────────────────────────────── */}
      <footer className="profile-page__footer">
        NUTRILENS V2.4.1 — THE VITAL CURATOR
      </footer>

      {/* ═══════════════════════════════════════════════════════════════════════
          LOGOUT CONFIRMATION MODAL
      ══════════════════════════════════════════════════════════════════════════ */}
      {showLogoutModal && (
        <div
          className="ps-modal-backdrop"
          onClick={() => setShowLogoutModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-modal-title"
        >
          <div className="ps-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ps-modal__icon-wrap">
              <LogOut size={22} />
            </div>
            <h3 id="logout-modal-title" className="ps-modal__title">
              Log out of NutriLens?
            </h3>
            <p className="ps-modal__desc">
              You'll need to sign back in to access your scan history and
              preferences.
            </p>
            <div className="ps-modal__actions">
              <button
                className="ps-modal__btn ps-modal__btn--cancel"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                className="ps-modal__btn ps-modal__btn--confirm"
                onClick={confirmLogout}
              >
                <LogOut size={14} />
                Yes, Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          FLOATING SAVE / CANCEL BAR (appears only when dirty)
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className={`ps-save-bar ${isDirty ? "ps-save-bar--visible" : ""}`}>
        <div className="ps-save-bar__inner">
          <span className="ps-save-bar__hint">
            <AlertTriangle size={14} />
            You have unsaved changes
          </span>
          <div className="ps-save-bar__actions">
            <button className="ps-save-bar__cancel" onClick={handleCancel}>
              Cancel
            </button>
            <button className="ps-save-bar__save" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
