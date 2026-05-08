import React, { useState } from 'react'
import '../styles/register.scss'
import { useAuthHook } from '../hooks/useAuthHook'
import { Link, useNavigate } from 'react-router'
import Google from '../../components/Google'


const Register = () => {
  const [ email, setEmail ] = useState("")
  const [ username, setUsername ] = useState("")
  const [ password, setPassword ] = useState("")
  const [ isAdmin, setIsAdmin ] = useState(false)

  const { handleRegister } = useAuthHook();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await handleRegister({ email, username, password, role: isAdmin ? 'admin' : 'user' })
      navigate('/login')
    } catch (err) {
      navigate('/error', {
        state: {
          status: err?.status,
          message: err?.message || "Unable to register. Please try again.",
        },
      })
    }
  }


  return (
    <div className="auth-page">
      <div className="auth-page__bg-decoration">
        <div className="auth-page__blob auth-page__blob--1" />
        <div className="auth-page__blob auth-page__blob--2" />
      </div>

      <main className="auth-page__main">
        {/* Brand */}
        <div className="auth-page__brand">
          <div className="auth-page__brand-icon">
            <img src="/LOGO.png" alt="NutriLens logo" />
          </div>
          <div className="auth-page__brand-text">
            <span className="auth-page__brand-name">NutriLens</span>
            <span className="auth-page__brand-sub">PREMIUM CURATOR</span>
          </div>
        </div>

        {/* Card */}
        <div className="auth-card">
          <div className="auth-card__header">
            <h1 className="auth-card__title">Create your account</h1>
            <p className="auth-card__subtitle">
              Start your personalised nutrition journey today
            </p>
          </div>

          {/* Google SSO */}
          <Google />

          <div className="auth-card__divider">
            <span>or register with email</span>
          </div>

          <form className="auth-card__form" onSubmit={handleSubmit}>
            <div className="auth-card__field">
              <label className="auth-card__label" htmlFor="register-username">
                Username
              </label>
              <input
                id="register-username"
                className="auth-card__input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
              />
            </div>

            <div className="auth-card__field">
              <label className="auth-card__label" htmlFor="register-email">
                Email address
              </label>
              <input
                id="register-email"
                className="auth-card__input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="auth-card__field">
              <label className="auth-card__label" htmlFor="register-password">
                Password
              </label>
              <input
                id="register-password"
                className="auth-card__input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
              />
            </div>

            <div className="auth-card__field">
              <label className="auth-label" htmlFor="register-isAdmin">
                <input
                  id="register-isAdmin"
                  type="checkbox"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                />
                <div className="admin_checkbox"></div>
                <span className="auth-card__label">Register as Admin</span>
              </label>
            </div>

            <button
              id="register-submit-btn"
              className="auth-card__submit"
              type="submit"
            >
              Create account
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>

          <p className="auth-card__switch">
            Already have an account?{" "}
            <Link to="/login" className="auth-card__switch-link">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default Register
