import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import '../styles/login.scss'
import { useAuthHook } from '../hooks/useAuthHook'
import Google from '../../components/Google'


const Login = () => {

    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")

    const { handleLogin } = useAuthHook();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault()
        await handleLogin({ email, password })
        navigate('/')
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
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12h20M12 2a10 10 0 0 1 0 20M12 2C6.5 7 6.5 17 12 22M12 2c5.5 5 5.5 15 0 20"/>
                    </svg>
                </div>
                <div className="auth-page__brand-text">
                    <span className="auth-page__brand-name">NutriLens</span>
                    <span className="auth-page__brand-sub">PREMIUM CURATOR</span>
                </div>
            </div>

            {/* Card */}
            <div className="auth-card">
                <div className="auth-card__header">
                    <h1 className="auth-card__title">Welcome back</h1>
                    <p className="auth-card__subtitle">Sign in to continue your nutrition journey</p>
                </div>

                {/* Google SSO */}
                <Google />

                <div className="auth-card__divider">
                    <span>or continue with email</span>
                </div>

                <form className="auth-card__form" onSubmit={handleSubmit}>
                    <div className="auth-card__field">
                        <label className="auth-card__label" htmlFor="login-email">Email address</label>
                        <input
                            id="login-email"
                            className="auth-card__input"
                            type='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="auth-card__field">
                        <div className="auth-card__label-row">
                            <label className="auth-card__label" htmlFor="login-password">Password</label>
                            <a href="#" className="auth-card__forgot">Forgot password?</a>
                        </div>
                        <input
                            id="login-password"
                            className="auth-card__input"
                            type='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button id="login-submit-btn" className="auth-card__submit" type="submit">
                        Sign in
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </button>
                </form>

                <p className="auth-card__switch">
                    Don't have an account?{' '}
                    <Link to="/register" className="auth-card__switch-link">Create one free</Link>
                </p>
            </div>
        </main>
    </div>
  )
}

export default Login
