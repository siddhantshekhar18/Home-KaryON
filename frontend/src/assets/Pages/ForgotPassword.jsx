import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ForgotPassword.css';

const API_URL = `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api').replace(/\/$/, '')}/auth`;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validate = () => {
    if (!email) { setEmailError('Email is required'); return false; }
    if (!/\S+@\S+\.\S+/.test(email)) { setEmailError('Please enter a valid email'); return false; }
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      await axios.post(`${API_URL}/forgot-password`, { email });
      setSubmitted(true);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fp-page">
      {/* Hero */}
      <div className="fp-hero">
        <div className="fp-particles">
          {[...Array(10)].map((_, i) => (
            <div key={i} className={`fp-particle fp-particle-${i + 1}`} />
          ))}
        </div>
        <div className="fp-hero-content">
          <h1 className="fp-hero-title">Forgot your<br /><span className="fp-hero-accent">Password?</span></h1>
          <p className="fp-hero-sub">No worries — we'll send you a reset link.</p>
        </div>
        <div className="fp-hero-wave">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path d="M0,40L120,45C240,50,480,60,720,58C960,56,1200,42,1320,38L1440,36L1440,80L0,80Z" />
          </svg>
        </div>
      </div>

      {/* Card */}
      <div className="fp-section">
        <div className="fp-card">
          {!submitted ? (
            <>
              <div className="fp-icon-wrap">
                <span className="fp-lock-icon">🔑</span>
              </div>
              <h2 className="fp-title">Reset Password</h2>
              <p className="fp-desc">
                Enter your registered email address and we'll send you a link to reset your password.
              </p>

              {errorMessage && (
                <div className="fp-alert fp-alert-error">{errorMessage}</div>
              )}

              <form onSubmit={handleSubmit} className="fp-form" noValidate>
                <div className="fp-field">
                  <label htmlFor="fp-email">
                    <span className="fp-label-icon">📧</span> Email Address
                  </label>
                  <input
                    id="fp-email"
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                      setErrorMessage('');
                    }}
                    className={`fp-input ${emailError ? 'fp-input-error' : ''}`}
                    autoComplete="email"
                  />
                  {emailError && <span className="fp-error-text">{emailError}</span>}
                </div>

                <button type="submit" className={`fp-btn ${isLoading ? 'fp-btn-loading' : ''}`} disabled={isLoading}>
                  {isLoading ? (
                    <span className="fp-spinner" />
                  ) : (
                    <>
                      Send Reset Link
                      <svg className="fp-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              <div className="fp-links">
                <Link to="/login" className="fp-back-link">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15">
                    <path d="M19 12H5M12 5l-7 7 7 7" />
                  </svg>
                  Back to Login
                </Link>
              </div>
            </>
          ) : (
            <div className="fp-success">
              <div className="fp-success-icon-wrap">
                <span className="fp-success-icon">✉️</span>
                <div className="fp-success-ring" />
              </div>
              <h2 className="fp-success-title">Check your inbox!</h2>
              <p className="fp-success-msg">
                If <strong>{email}</strong> is registered with KaryON, you'll receive a password reset link shortly.
              </p>
              <ul className="fp-success-tips">
                <li>Check your spam / junk folder if you don't see it.</li>
                <li>The link expires in <strong>30 minutes</strong>.</li>
                <li>Only the most recent reset link will be valid.</li>
              </ul>
              <div className="fp-success-actions">
                <button
                  className="fp-resend-btn"
                  onClick={() => { setSubmitted(false); setEmail(''); }}
                >
                  Try a different email
                </button>
                <Link to="/login" className="fp-login-btn">Back to Login</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
