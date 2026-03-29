import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ForgotPassword.css';

const API_URL = `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api').replace(/\/$/, '')}/auth`;

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [done, setDone] = useState(false);

  const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score; // 0-4
  };

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', '#f44336', '#ff9800', '#4caf50', '#667eea'];
  const pwdStrength = getStrength(password);

  const validate = () => {
    const e = {};
    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'Minimum 8 characters';
    if (!confirm) e.confirm = 'Please confirm your password';
    else if (password !== confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      await axios.post(`${API_URL}/reset-password/${token}`, { password });
      setDone(true);
      setTimeout(() => navigate('/login'), 4000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fp-page">
      {/* Hero */}
      <div className="fp-hero rp-hero">
        <div className="fp-particles">
          {[...Array(10)].map((_, i) => (
            <div key={i} className={`fp-particle fp-particle-${i + 1}`} />
          ))}
        </div>
        <div className="fp-hero-content">
          <h1 className="fp-hero-title">Create a New<br /><span className="fp-hero-accent">Password</span></h1>
          <p className="fp-hero-sub">Choose a strong password to secure your account.</p>
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
          {!done ? (
            <>
              <div className="fp-icon-wrap">
                <span className="fp-lock-icon">🔒</span>
              </div>
              <h2 className="fp-title">Set New Password</h2>
              <p className="fp-desc">Your new password must be at least 8 characters long.</p>

              {errorMessage && (
                <div className="fp-alert fp-alert-error">
                  {errorMessage}
                  {errorMessage.toLowerCase().includes('expired') || errorMessage.toLowerCase().includes('invalid') ? (
                    <span> <Link to="/forgot-password" className="fp-alert-link">Request a new link</Link></span>
                  ) : null}
                </div>
              )}

              <form onSubmit={handleSubmit} className="fp-form" noValidate>
                {/* New password */}
                <div className="fp-field">
                  <label htmlFor="rp-password">
                    <span className="fp-label-icon">🔑</span> New Password
                  </label>
                  <div className="fp-pwd-wrap">
                    <input
                      id="rp-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); setErrorMessage(''); }}
                      className={`fp-input fp-input-pwd ${errors.password ? 'fp-input-error' : ''}`}
                    />
                    <button type="button" className="fp-eye" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {password && (
                    <div className="fp-strength">
                      <div className="fp-strength-bar">
                        {[1, 2, 3, 4].map((s) => (
                          <div
                            key={s}
                            className="fp-strength-seg"
                            style={{ background: s <= pwdStrength ? strengthColor[pwdStrength] : '#e2e8f0' }}
                          />
                        ))}
                      </div>
                      <span className="fp-strength-label" style={{ color: strengthColor[pwdStrength] }}>
                        {strengthLabel[pwdStrength]}
                      </span>
                    </div>
                  )}
                  {errors.password && <span className="fp-error-text">{errors.password}</span>}
                </div>

                {/* Confirm password */}
                <div className="fp-field">
                  <label htmlFor="rp-confirm">
                    <span className="fp-label-icon">🔒</span> Confirm Password
                  </label>
                  <div className="fp-pwd-wrap">
                    <input
                      id="rp-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Re-enter your new password"
                      value={confirm}
                      onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: '' })); }}
                      className={`fp-input fp-input-pwd ${errors.confirm ? 'fp-input-error' : ''}`}
                    />
                    <button type="button" className="fp-eye" onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {confirm && password === confirm && (
                    <span className="fp-match-ok">✅ Passwords match</span>
                  )}
                  {errors.confirm && <span className="fp-error-text">{errors.confirm}</span>}
                </div>

                {/* Password rules */}
                <ul className="fp-rules">
                  <li className={password.length >= 8 ? 'rule-ok' : ''}>At least 8 characters</li>
                  <li className={/[A-Z]/.test(password) ? 'rule-ok' : ''}>One uppercase letter</li>
                  <li className={/[0-9]/.test(password) ? 'rule-ok' : ''}>One number</li>
                  <li className={/[^A-Za-z0-9]/.test(password) ? 'rule-ok' : ''}>One special character</li>
                </ul>

                <button type="submit" className={`fp-btn ${isLoading ? 'fp-btn-loading' : ''}`} disabled={isLoading}>
                  {isLoading ? (
                    <span className="fp-spinner" />
                  ) : (
                    <>
                      Reset Password
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
                <span className="fp-success-icon">✅</span>
                <div className="fp-success-ring" />
              </div>
              <h2 className="fp-success-title">Password Reset!</h2>
              <p className="fp-success-msg">
                Your password has been successfully updated. Redirecting you to login in a few seconds…
              </p>
              <div className="fp-success-actions">
                <Link to="/login" className="fp-login-btn">Go to Login</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
