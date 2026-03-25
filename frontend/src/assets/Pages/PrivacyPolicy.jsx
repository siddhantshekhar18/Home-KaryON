import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';

const sections = [
  { id: 'info-collect', title: '1. Information We Collect', icon: '📋' },
  { id: 'how-use', title: '2. How We Use Your Information', icon: '⚙️' },
  { id: 'sharing', title: '3. Sharing of Information', icon: '🤝' },
  { id: 'cookies', title: '4. Cookies & Tracking', icon: '🍪' },
  { id: 'security', title: '5. Data Security', icon: '🔒' },
  { id: 'rights', title: '6. Your Rights', icon: '⚖️' },
  { id: 'retention', title: '7. Data Retention', icon: '🗓️' },
  { id: 'children', title: "8. Children's Privacy", icon: '👶' },
  { id: 'changes', title: '9. Changes to This Policy', icon: '📝' },
  { id: 'contact', title: '10. Contact Us', icon: '📩' },
];

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState('info-collect');
  const [scrollProgress, setScrollProgress] = useState(0);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const scrollTop = window.scrollY;
      const totalHeight = el.scrollHeight - el.clientHeight;
      setScrollProgress(totalHeight > 0 ? (scrollTop / totalHeight) * 100 : 0);

      // Highlight active section
      sections.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) setActiveSection(id);
        }
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="legal-page">
      {/* Progress Bar */}
      <div className="legal-progress-bar" style={{ width: `${scrollProgress}%` }} />

      {/* Hero */}
      <div className="legal-hero">
        <div className="legal-hero-particles">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`legal-particle legal-particle-${i + 1}`} />
          ))}
        </div>
        <div className="legal-hero-content">
          <div className="legal-badge">
            <span className="badge-icon">🔒</span>
            <span>Your Privacy Matters</span>
          </div>
          <h1 className="legal-hero-title">Privacy Policy</h1>
          <p className="legal-hero-subtitle">
            We are committed to protecting your personal information and your right to privacy.
          </p>
          <div className="legal-meta">
            <span>Last updated: <strong>March 14, 2026</strong></span>
            <span className="meta-dot">•</span>
            <span>Effective: <strong>January 1, 2024</strong></span>
            <span className="meta-dot">•</span>
            <span>~8 min read</span>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="legal-layout">
        {/* Sidebar TOC */}
        <aside className="legal-toc">
          <div className="toc-sticky">
            <h3 className="toc-title">Table of Contents</h3>
            <ul className="toc-list">
              {sections.map(({ id, title, icon }) => (
                <li key={id}>
                  <button
                    className={`toc-link ${activeSection === id ? 'active' : ''}`}
                    onClick={() => scrollTo(id)}
                  >
                    <span className="toc-icon">{icon}</span>
                    <span>{title}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="toc-cta">
              <p>Questions about your privacy?</p>
              <Link to="/contact" className="toc-contact-btn">Contact Us</Link>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="legal-content" ref={contentRef}>
          <div className="legal-intro-card">
            <p>
              This Privacy Policy describes how <strong>KaryON</strong> ("we", "us", or "our") collects, uses,
              and shares information about you when you use our website, mobile application, and services
              (collectively, the "Platform"). By using the Platform, you agree to the collection and use of
              information in accordance with this policy.
            </p>
          </div>

          {/* Section 1 */}
          <section id="info-collect" className="legal-section">
            <div className="section-header">
              <span className="section-icon">📋</span>
              <h2>1. Information We Collect</h2>
            </div>
            <h3>1.1 Information You Provide</h3>
            <ul className="legal-list">
              <li><strong>Account Information:</strong> Name, email address, phone number, and password when you register.</li>
              <li><strong>Profile Information:</strong> Profile photo, address, payment method details.</li>
              <li><strong>Booking Information:</strong> Service type, preferred date/time, address, and any special instructions.</li>
              <li><strong>Communications:</strong> Messages you send to our support team or through contact forms.</li>
            </ul>
            <h3>1.2 Information Collected Automatically</h3>
            <ul className="legal-list">
              <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers.</li>
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent on pages, links clicked.</li>
              <li><strong>Location Information:</strong> With your permission, approximate location for service matching.</li>
              <li><strong>Cookies:</strong> Session cookies, preference cookies, and analytics cookies.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section id="how-use" className="legal-section">
            <div className="section-header">
              <span className="section-icon">⚙️</span>
              <h2>2. How We Use Your Information</h2>
            </div>
            <p>We use the collected information for the following purposes:</p>
            <div className="use-grid">
              {[
                { icon: '✅', title: 'Service Delivery', desc: 'Process and manage your bookings, assign professionals, and deliver services.' },
                { icon: '📧', title: 'Communications', desc: 'Send confirmations, updates, and service reminders to your registered contact.' },
                { icon: '📊', title: 'Analytics', desc: 'Analyze usage patterns to improve our platform and user experience.' },
                { icon: '🛡️', title: 'Security', desc: 'Detect fraud, prevent abuse, and maintain the safety of our platform.' },
                { icon: '⚖️', title: 'Legal Compliance', desc: 'Meet our legal obligations and enforce our Terms of Service.' },
                { icon: '🎯', title: 'Personalization', desc: 'Tailor recommendations, offers, and content based on your preferences.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="use-card">
                  <span className="use-icon">{icon}</span>
                  <h4>{title}</h4>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3 */}
          <section id="sharing" className="legal-section">
            <div className="section-header">
              <span className="section-icon">🤝</span>
              <h2>3. Sharing of Information</h2>
            </div>
            <p>We do not sell your personal information. We may share it in these limited circumstances:</p>
            <ul className="legal-list">
              <li><strong>Service Professionals:</strong> Your name, address, and booking details are shared only with the professional assigned to your job.</li>
              <li><strong>Payment Processors:</strong> Payment information is processed by trusted third-party payment gateways. We do not store full card details.</li>
              <li><strong>Analytics Providers:</strong> Aggregated, anonymized data may be shared with analytics services.</li>
              <li><strong>Legal Requirements:</strong> We may disclose information when required by law, court order, or governmental authority.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger or acquisition, your information may be transferred with appropriate notice.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="cookies" className="legal-section">
            <div className="section-header">
              <span className="section-icon">🍪</span>
              <h2>4. Cookies &amp; Tracking</h2>
            </div>
            <p>We use cookies and similar tracking technologies to enhance your experience.</p>
            <div className="cookie-table-wrapper">
              <table className="cookie-table">
                <thead>
                  <tr>
                    <th>Cookie Type</th>
                    <th>Purpose</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Essential</td><td>Keep you logged in and maintain session security</td><td>Session</td></tr>
                  <tr><td>Preference</td><td>Remember your language and display preferences</td><td>1 year</td></tr>
                  <tr><td>Analytics</td><td>Understand how users navigate and use our platform</td><td>90 days</td></tr>
                  <tr><td>Marketing</td><td>Deliver relevant promotions and measure campaign performance</td><td>30 days</td></tr>
                </tbody>
              </table>
            </div>
            <p>You can control cookies through your browser settings. Disabling essential cookies may affect platform functionality.</p>
          </section>

          {/* Section 5 */}
          <section id="security" className="legal-section">
            <div className="section-header">
              <span className="section-icon">🔒</span>
              <h2>5. Data Security</h2>
            </div>
            <p>We implement industry-standard security measures to protect your data:</p>
            <ul className="legal-list">
              <li>All data transmissions are encrypted using TLS (HTTPS).</li>
              <li>Passwords are hashed using bcrypt and never stored in plain text.</li>
              <li>Access to user data is restricted to authorized personnel on a need-to-know basis.</li>
              <li>We conduct regular security audits and vulnerability assessments.</li>
            </ul>
            <div className="highlight-box">
              <span className="highlight-icon">⚠️</span>
              <p>While we use commercially reasonable security measures, no system is 100% secure. We encourage you to use a strong, unique password and never share your login credentials.</p>
            </div>
          </section>

          {/* Section 6 */}
          <section id="rights" className="legal-section">
            <div className="section-header">
              <span className="section-icon">⚖️</span>
              <h2>6. Your Rights</h2>
            </div>
            <p>You have the following rights regarding your personal data:</p>
            <ul className="legal-list">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong>Deletion:</strong> Request deletion of your data (subject to legal obligations).</li>
              <li><strong>Portability:</strong> Request a machine-readable export of your data.</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time.</li>
              <li><strong>Restrict Processing:</strong> Request that we restrict how we process your data.</li>
            </ul>
            <p>To exercise any of these rights, contact us at <a href="mailto:privacy@karyon.com" className="inline-link">privacy@karyon.com</a>.</p>
          </section>

          {/* Section 7 */}
          <section id="retention" className="legal-section">
            <div className="section-header">
              <span className="section-icon">🗓️</span>
              <h2>7. Data Retention</h2>
            </div>
            <p>
              We retain your personal information for as long as your account is active or as needed to provide services.
              After account deletion, we retain minimal data for up to 90 days for fraud prevention and legal compliance,
              after which it is permanently deleted or anonymized.
            </p>
          </section>

          {/* Section 8 */}
          <section id="children" className="legal-section">
            <div className="section-header">
              <span className="section-icon">👶</span>
              <h2>8. Children's Privacy</h2>
            </div>
            <p>
              KaryON is not directed to children under 13 years of age. We do not knowingly collect personal information
              from children under 13. If you believe we have inadvertently collected such information, please contact us
              immediately and we will promptly delete it.
            </p>
          </section>

          {/* Section 9 */}
          <section id="changes" className="legal-section">
            <div className="section-header">
              <span className="section-icon">📝</span>
              <h2>9. Changes to This Policy</h2>
            </div>
            <p>
              We may update this Privacy Policy periodically to reflect changes in our practices or applicable law.
              We will notify you of significant changes via email or a prominent notice on our Platform at least
              30 days before the changes take effect. Continued use of the Platform after the effective date
              constitutes acceptance.
            </p>
          </section>

          {/* Section 10 */}
          <section id="contact" className="legal-section">
            <div className="section-header">
              <span className="section-icon">📩</span>
              <h2>10. Contact Us</h2>
            </div>
            <p>For any questions or concerns about this Privacy Policy, contact our Data Protection team:</p>
            <div className="contact-card-grid">
              <div className="contact-card-item">
                <span>📧</span>
                <a href="mailto:privacy@karyon.com">privacy@karyon.com</a>
              </div>
              <div className="contact-card-item">
                <span>📞</span>
                <a href="tel:+919305724440">+91 93057 24440</a>
              </div>
              <div className="contact-card-item">
                <span>📍</span>
                <span>Rooma, Kanpur, Uttar Pradesh, India</span>
              </div>
            </div>
          </section>

          {/* Bottom CTA */}
          <div className="legal-bottom-cta">
            <p>Have more legal questions?</p>
            <div className="legal-cta-buttons">
              <Link to="/terms" className="legal-cta-btn primary">Terms of Service</Link>
              <Link to="/faq" className="legal-cta-btn secondary">View FAQ</Link>
              <Link to="/contact" className="legal-cta-btn secondary">Contact Us</Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
