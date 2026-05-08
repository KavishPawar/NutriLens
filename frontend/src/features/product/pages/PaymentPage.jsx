import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Star,
  Lock,
  CreditCard,
  Loader2,
  ChevronDown,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { updateSubscription } from '../services/admin.api';
import '../styles/payment.scss';

// ── Plan definitions ──────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'free',
    name: 'Basic',
    price: '£0',
    period: '/month',
    badge: null,
    variant: '',
    btnVariant: 'free',
    btnLabel: 'Current Plan',
    disabled: true,
    features: [
      { text: '10 scans / month',      included: true  },
      { text: 'Basic nutrition info',   included: true  },
      { text: 'Scan history',           included: false },
      { text: 'AI insights',            included: false },
      { text: 'Priority support',       included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '£4.99',
    period: '/month',
    badge: { label: 'Most Popular', variant: 'popular' },
    variant: 'premium',
    btnVariant: 'premium',
    btnLabel: 'Upgrade to Premium',
    disabled: false,
    features: [
      { text: 'Unlimited scans',          included: true },
      { text: 'Full nutrition breakdown',  included: true },
      { text: '30-day scan history',       included: true },
      { text: 'Basic AI insights',         included: true },
      { text: 'Priority support',          included: true },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '£9.99',
    period: '/month',
    badge: { label: 'Best Value', variant: 'value' },
    variant: 'pro',
    btnVariant: 'pro',
    btnLabel: 'Go Pro',
    disabled: false,
    features: [
      { text: 'Everything in Premium',     included: true },
      { text: 'Unlimited history',         included: true },
      { text: 'Advanced AI models',        included: true },
      { text: 'Eco-score analytics',       included: true },
      { text: 'API access',                included: true },
    ],
  },
];

// ── FAQ data ──────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes, NutriLens is a flexible subscription. You can cancel your Premium or Pro plan at any time from your settings. You will maintain access until the end of your current billing period.',
  },
  {
    q: 'Is my payment information secure?',
    a: 'Absolutely. We use Stripe for payment processing — a PCI Level 1 Service Provider. Your sensitive card data never touches our servers.',
  },
  {
    q: 'What happens when I upgrade?',
    a: 'Features are unlocked instantly. Your scan limit resets to unlimited immediately, and the last 30 days of data appears in your history within seconds.',
  },
];

// ── Feature Icon helper ────────────────────────────────────────────────────────
const FeatureIcon = ({ included, isDark }) => {
  if (included) {
    return isDark
      ? <Star size={16} className="plan-card__feature-icon plan-card__feature-icon--star" />
      : <CheckCircle2 size={16} className="plan-card__feature-icon plan-card__feature-icon--check" />;
  }
  return <XCircle size={16} className="plan-card__feature-icon plan-card__feature-icon--cross" />;
};

// ── FAQ Item ──────────────────────────────────────────────────────────────────
const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button className="faq-item__toggle" onClick={() => setOpen((o) => !o)}>
        {q}
        <ChevronDown size={16} className={`faq-chevron ${open ? 'faq-chevron--open' : ''}`} />
      </button>
      {open && <p className="faq-item__body">{a}</p>}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const PaymentPage = () => {
  const navigate = useNavigate();

  const [selectedPlan,  setSelectedPlan]  = useState(null);   // plan id
  const [paymentStatus, setPaymentStatus] = useState('idle');  // 'idle' | 'processing' | 'success' | 'error'
  const [payError,      setPayError]      = useState('');

  // ── Card form state ────────────────────────────────────────────────────────
  const [cardNumber,   setCardNumber]   = useState('');
  const [expiry,       setExpiry]       = useState('');
  const [cvv,          setCvv]          = useState('');
  const [cardName,     setCardName]     = useState('');

  // ── Formatters ─────────────────────────────────────────────────────────────
  const fmtCard = (v) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const fmtExpiry = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
  };

  // ── Plan selection ─────────────────────────────────────────────────────────
  const handlePlanClick = (plan) => {
    if (plan.disabled) return;
    setSelectedPlan(plan.id);
    setPaymentStatus('idle');
    setPayError('');
    // Scroll to payment form smoothly
    setTimeout(() => {
      document.getElementById('payment-form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // ── Payment submit ─────────────────────────────────────────────────────────
  const handlePaySubmit = async (e) => {
    e.preventDefault();

    // Basic client validation
    if (cardNumber.replace(/\s/g, '').length < 16) {
      setPayError('Please enter a valid 16-digit card number.');
      return;
    }
    if (!expiry || !cvv || !cardName) {
      setPayError('Please fill in all payment fields.');
      return;
    }

    setPayError('');
    setPaymentStatus('processing');

    try {
      // Call backend to update subscription (mock / real Stripe flow)
      await updateSubscription({ plan: selectedPlan });
      setPaymentStatus('success');
    } catch (err) {
      setPaymentStatus('error');
      setPayError(err?.response?.data?.message || 'Payment failed. Please try again.');
    }
  };

  // ── Success view ───────────────────────────────────────────────────────────
  if (paymentStatus === 'success') {
    const planLabel = PLANS.find((p) => p.id === selectedPlan)?.name || '';
    return (
      <div className="payment-page">
        <div className="payment-success">
          <div className="payment-success__icon">
            <CheckCircle2 size={36} />
          </div>
          <h1 className="payment-success__title">You're all set! 🎉</h1>
          <p className="payment-success__desc">
            Welcome to NutriLens <strong>{planLabel}</strong>. Your new features are active immediately.
          </p>
          <button className="payment-success__btn" onClick={() => navigate('/profile')}>
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  const selectedPlanObj = PLANS.find((p) => p.id === selectedPlan);

  return (
    <div className="payment-page">
      {/* ── Hero ── */}
      <div className="payment-hero">
        <div className="payment-hero__eyebrow">
          <Zap size={11} /> Choose Your Plan
        </div>
        <h1 className="payment-hero__title">Unlock NutriLens Premium</h1>
        <p className="payment-hero__subtitle">
          Unlock the full power of NutriLens nutrition insights. Cancel anytime.
        </p>
      </div>

      {/* ── Plan Cards ── */}
      <div className="payment-plans">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={[
              'plan-card',
              plan.variant ? `plan-card--${plan.variant}` : '',
              selectedPlan === plan.id ? 'plan-card--selected' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => handlePlanClick(plan)}
            id={`plan-card-${plan.id}`}
            role="button"
            tabIndex={plan.disabled ? -1 : 0}
            onKeyDown={(e) => e.key === 'Enter' && handlePlanClick(plan)}
          >
            {plan.badge && (
              <span className={`plan-card__badge plan-card__badge--${plan.badge.variant}`}>
                {plan.badge.label}
              </span>
            )}

            <p className="plan-card__name">{plan.name}</p>

            <div className="plan-card__price-row">
              <span className="plan-card__price">{plan.price}</span>
              <span className="plan-card__period">{plan.period}</span>
            </div>

            <ul className="plan-card__features">
              {plan.features.map((feat) => (
                <li className="plan-card__feature" key={feat.text}>
                  <FeatureIcon included={feat.included} isDark={plan.variant === 'pro'} />
                  <span className="plan-card__feature-text">{feat.text}</span>
                </li>
              ))}
            </ul>

            <button
              className={`plan-card__btn plan-card__btn--${plan.btnVariant}`}
              disabled={plan.disabled}
              onClick={(e) => { e.stopPropagation(); handlePlanClick(plan); }}
              id={`plan-btn-${plan.id}`}
            >
              {plan.btnLabel}
            </button>
          </div>
        ))}
      </div>

      {/* ── Payment Form (shown only after plan selected) ── */}
      {selectedPlan && selectedPlan !== 'free' && (
        <div className="payment-form-section" id="payment-form-section">
          <div className="payment-form-card">
            <div className="payment-form-card__header">
              <h2 className="payment-form-card__title">Payment Details</h2>
              <span className="payment-form-card__selected-plan">
                <CreditCard size={12} />
                {selectedPlanObj?.name} — {selectedPlanObj?.price}/mo
              </span>
            </div>

            <form onSubmit={handlePaySubmit}>
              <div className="payment-form-card__fields">
                {/* Card Number */}
                <div className="pay-field">
                  <label className="pay-field__label" htmlFor="pay-card-number">Card Number</label>
                  <input
                    id="pay-card-number"
                    className="pay-field__input"
                    type="text"
                    inputMode="numeric"
                    maxLength={19}
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(fmtCard(e.target.value))}
                    autoComplete="cc-number"
                  />
                </div>

                {/* Expiry + CVV */}
                <div className="payment-form-card__row">
                  <div className="pay-field">
                    <label className="pay-field__label" htmlFor="pay-expiry">Expiry Date</label>
                    <input
                      id="pay-expiry"
                      className="pay-field__input"
                      type="text"
                      inputMode="numeric"
                      maxLength={7}
                      placeholder="MM / YY"
                      value={expiry}
                      onChange={(e) => setExpiry(fmtExpiry(e.target.value))}
                      autoComplete="cc-exp"
                    />
                  </div>
                  <div className="pay-field">
                    <label className="pay-field__label" htmlFor="pay-cvv">CVV</label>
                    <input
                      id="pay-cvv"
                      className="pay-field__input"
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="•••"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      autoComplete="cc-csc"
                    />
                  </div>
                </div>

                {/* Cardholder Name */}
                <div className="pay-field">
                  <label className="pay-field__label" htmlFor="pay-name">Cardholder Name</label>
                  <input
                    id="pay-name"
                    className="pay-field__input"
                    type="text"
                    placeholder="Full name on card"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    autoComplete="cc-name"
                  />
                </div>

                {/* Error message */}
                {(payError || paymentStatus === 'error') && (
                  <p style={{ fontSize: '0.8125rem', color: '#dc2626', fontWeight: 500 }}>
                    {payError || 'Payment failed. Please try again.'}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="payment-form-card__submit-btn"
                id="pay-submit-btn"
                disabled={paymentStatus === 'processing'}
              >
                {paymentStatus === 'processing' ? (
                  <><Loader2 size={18} className="spin" /> Processing…</>
                ) : (
                  <><Lock size={16} /> Pay Securely</>
                )}
              </button>

              <p className="payment-form-card__secure-note">
                <Lock size={11} />
                256-bit SSL encrypted · Powered by Stripe
              </p>

              <button
                type="button"
                className="payment-form-card__cancel"
                onClick={() => { setSelectedPlan(null); setPaymentStatus('idle'); }}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── FAQ ── */}
      <div className="payment-faq">
        <h2 className="payment-faq__title">Frequently Asked Questions</h2>
        {FAQS.map((faq) => (
          <FaqItem key={faq.q} q={faq.q} a={faq.a} />
        ))}
      </div>

      <footer className="payment-footer">
        NUTRILENS V2.4.1 — THE VITAL CURATOR
      </footer>
    </div>
  );
};

export default PaymentPage;
