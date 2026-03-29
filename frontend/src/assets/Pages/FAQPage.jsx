import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './FAQPage.css';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api').replace(/\/$/, '');

const CATEGORIES = ['All', 'General', 'Booking', 'Payment', 'Services', 'Account', 'Safety'];

const FAQPage = () => {
  const [allFaqs, setAllFaqs] = useState([]); // full dataset for counts
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState('');
  const [votes, setVotes] = useState({}); // faqId -> 'yes'|'no'
  const [askForm, setAskForm] = useState({ name: '', email: '', question: '' });
  const [askStatus, setAskStatus] = useState('');
  const [askLoading, setAskLoading] = useState(false);
  const heroRef = useRef(null);

  // Always fetch ALL FAQs once, then filter client-side
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${API_BASE}/faq`);
        if (!res.ok) throw new Error('Failed to fetch FAQs');
        const data = await res.json();
        setAllFaqs(data.data || []);
      } catch {
        setError('Unable to load FAQs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchFAQs();
  }, []); // fetch once on mount

  // Derive filtered list from allFaqs client-side
  const faqs = activeCategory === 'All'
    ? allFaqs
    : allFaqs.filter((f) => f.category === activeCategory);

  // Filter by search
  const displayed = search.trim()
    ? faqs.filter(
        (f) =>
          f.question.toLowerCase().includes(search.toLowerCase()) ||
          f.answer.toLowerCase().includes(search.toLowerCase())
      )
    : faqs;

  const toggle = (id) => setOpenId(openId === id ? null : id);

  // Vote
  const handleVote = async (faqId, vote) => {
    if (votes[faqId]) return; // already voted
    try {
      const res = await fetch(`${API_BASE}/faq/${faqId}/helpful`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setVotes((prev) => ({ ...prev, [faqId]: vote }));
      // Update local state counts
      setAllFaqs((prev) =>
        prev.map((f) =>
          f._id === faqId
            ? { ...f, helpful: data.helpful, notHelpful: data.notHelpful }
            : f
        )
      );
    } catch {
      // silently ignore vote errors
    }
  };

  // Ask a question (submits via contact API)
  const handleAskSubmit = async (e) => {
    e.preventDefault();
    if (!askForm.name || !askForm.email || !askForm.question) {
      setAskStatus('error');
      return;
    }
    setAskLoading(true);
    setAskStatus('');
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: askForm.name,
          email: askForm.email,
          phone: '0000000000',
          message: `[FAQ Question] ${askForm.question}`,
        }),
      });
      if (!res.ok) throw new Error();
      setAskStatus('success');
      setAskForm({ name: '', email: '', question: '' });
    } catch {
      setAskStatus('error');
    } finally {
      setAskLoading(false);
    }
  };

  // Group FAQs by category for the overview cards (always from full dataset)
  const categoryStats = CATEGORIES.slice(1).map((cat) => ({
    name: cat,
    count: allFaqs.filter((f) => f.category === cat).length,
    icon: { General: '💡', Booking: '📅', Payment: '💳', Services: '🔧', Account: '👤', Safety: '🛡️' }[cat],
  }));

  return (
    <div className="faq-page">
      {/* Hero */}
      <div className="faq-hero" ref={heroRef}>
        <div className="faq-hero-particles">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`faq-particle faq-particle-${i + 1}`} />
          ))}
        </div>
        <div className="faq-hero-content">
          <div className="faq-badge">
            <span>❓</span>
            <span>Help Center</span>
          </div>
          <h1 className="faq-hero-title">Frequently Asked<br />Questions</h1>
          <p className="faq-hero-subtitle">
            Everything you need to know about KaryON. Can't find an answer? Ask us directly.
          </p>
          {/* Hero Search */}
          <div className="faq-hero-search">
            <svg className="faq-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search your question..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="faq-hero-search-input"
            />
            {search && (
              <button className="faq-search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
        </div>
      </div>

      <div className="faq-main">
        {/* Category Overview Cards */}
        {!search && (
          <div className="faq-cats-overview">
            {categoryStats.map(({ name, count, icon }) => (
              <button
                key={name}
                className={`faq-cat-chip ${activeCategory === name ? 'active' : ''}`}
                onClick={() => { setActiveCategory(name); setOpenId(null); }}
              >
                <span className="chip-icon">{icon}</span>
                <span className="chip-name">{name}</span>
                <span className="chip-count">{count}</span>
              </button>
            ))}
            <button
              className={`faq-cat-chip ${activeCategory === 'All' ? 'active' : ''}`}
              onClick={() => { setActiveCategory('All'); setOpenId(null); }}
            >
              <span className="chip-icon">🌐</span>
              <span className="chip-name">All</span>
              <span className="chip-count">{allFaqs.length}</span>
            </button>
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className="faq-tabs-wrap">
          <div className="faq-tabs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`faq-tab ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => { setActiveCategory(cat); setOpenId(null); }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        {search && (
          <p className="faq-search-note">
            {displayed.length} result(s) for "<strong>{search}</strong>"
            <button className="faq-clear-search" onClick={() => setSearch('')}>Clear</button>
          </p>
        )}

        {/* FAQ List */}
        <div className="faq-list-container">
          {loading ? (
            <div className="faq-loading">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="faq-skeleton">
                  <div className="skeleton-q" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="faq-error">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
              <button className="faq-retry-btn" onClick={() => setActiveCategory(activeCategory)}>
                Retry
              </button>
            </div>
          ) : displayed.length === 0 ? (
            <div className="faq-empty">
              <span className="empty-icon">🔍</span>
              <h3>No FAQs found</h3>
              <p>Try a different category or search term.</p>
              <button className="faq-retry-btn" onClick={() => { setSearch(''); setActiveCategory('All'); }}>
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="faq-accordion">
              {displayed.map((faq) => (
                <div
                  key={faq._id}
                  className={`faq-item ${openId === faq._id ? 'open' : ''}`}
                >
                  <button className="faq-question" onClick={() => toggle(faq._id)}>
                    <div className="faq-q-inner">
                      <span className="faq-cat-tag">{faq.category}</span>
                      <span className="faq-q-text">{faq.question}</span>
                    </div>
                    <span className={`faq-chevron ${openId === faq._id ? 'rotated' : ''}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </button>

                  {openId === faq._id && (
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                      <div className="faq-helpful">
                        <span className="helpful-label">Was this helpful?</span>
                        <div className="helpful-btns">
                          <button
                            className={`helpful-btn yes ${votes[faq._id] === 'yes' ? 'voted' : ''}`}
                            onClick={() => handleVote(faq._id, 'yes')}
                            disabled={!!votes[faq._id]}
                          >
                            👍 {faq.helpful > 0 ? faq.helpful : ''}
                          </button>
                          <button
                            className={`helpful-btn no ${votes[faq._id] === 'no' ? 'voted' : ''}`}
                            onClick={() => handleVote(faq._id, 'no')}
                            disabled={!!votes[faq._id]}
                          >
                            👎 {faq.notHelpful > 0 ? faq.notHelpful : ''}
                          </button>
                        </div>
                        {votes[faq._id] && (
                          <span className="voted-msg">
                            {votes[faq._id] === 'yes' ? '✅ Thanks for your feedback!' : '🙏 We\'ll improve this answer.'}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ask a Question Section */}
        <div className="faq-ask-section">
          <div className="faq-ask-content">
            <div className="faq-ask-left">
              <span className="ask-icon">💬</span>
              <h2>Didn't find your answer?</h2>
              <p>
                Send us your question and our support team will get back to you within
                24 hours.
              </p>
              <div className="ask-contact-links">
                <Link to="/contact" className="ask-link">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  Contact Page
                </Link>
                <a href="tel:+919305724440" className="ask-link">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8 10a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  +91 93057 24440
                </a>
              </div>
            </div>
            <form className="faq-ask-form" onSubmit={handleAskSubmit}>
              <h3>Ask a Question</h3>
              {askStatus === 'success' && (
                <div className="ask-success">
                  ✅ Your question has been submitted. We'll get back to you within 24 hours!
                </div>
              )}
              {askStatus === 'error' && (
                <div className="ask-error">
                  ⚠️ Something went wrong. Please fill all fields and try again.
                </div>
              )}
              <div className="ask-field">
                <label>Your Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={askForm.name}
                  onChange={(e) => setAskForm({ ...askForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="ask-field">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={askForm.email}
                  onChange={(e) => setAskForm({ ...askForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="ask-field">
                <label>Your Question</label>
                <textarea
                  placeholder="Type your question here..."
                  rows="4"
                  value={askForm.question}
                  onChange={(e) => setAskForm({ ...askForm, question: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="ask-submit-btn" disabled={askLoading}>
                {askLoading ? (
                  <span className="ask-spinner" />
                ) : (
                  <>
                    Send Question
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16">
                      <path d="m22 2-7 20-4-9-9-4 20-7z"/>
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
