import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';
import './TermsOfService.css';

const sections = [
  { id: 'acceptance', title: '1. Acceptance of Terms', icon: '✅' },
  { id: 'eligibility', title: '2. Eligibility', icon: '🪪' },
  { id: 'account', title: '3. Account Registration', icon: '👤' },
  { id: 'services', title: '4. Our Services', icon: '🔧' },
  { id: 'booking', title: '5. Booking & Payments', icon: '💳' },
  { id: 'conduct', title: '6. User Conduct', icon: '🤝' },
  { id: 'professionals', title: '7. Professionals', icon: '👷' },
  { id: 'ip', title: '8. Intellectual Property', icon: '©️' },
  { id: 'liability', title: '9. Limitation of Liability', icon: '⚖️' },
  { id: 'termination', title: '10. Termination', icon: '🚫' },
  { id: 'governing', title: '11. Governing Law', icon: '🏛️' },
  { id: 'contact', title: '12. Contact', icon: '📩' },
];

const TermsOfService = () => {
  const [activeSection, setActiveSection] = useState('acceptance');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
      sections.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) {
          const r = el.getBoundingClientRect();
          if (r.top <= 120 && r.bottom >= 120) setActiveSection(id);
        }
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="legal-page">
      <div className="legal-progress-bar" style={{ width: `${scrollProgress}%` }} />

      {/* Hero */}
      <div className="legal-hero tos-hero">
        <div className="legal-hero-particles">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`legal-particle legal-particle-${i + 1}`} />
          ))}
        </div>
        <div className="legal-hero-content">
          <div className="legal-badge">
            <span className="badge-icon">📜</span>
            <span>Terms &amp; Conditions</span>
          </div>
          <h1 className="legal-hero-title">Terms of Service</h1>
          <p className="legal-hero-subtitle">
            Please read these terms carefully before using the KaryON platform.
          </p>
          <div className="legal-meta">
            <span>Last updated: <strong>March 14, 2026</strong></span>
            <span className="meta-dot">•</span>
            <span>Effective: <strong>January 1, 2024</strong></span>
            <span className="meta-dot">•</span>
            <span>~10 min read</span>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="legal-layout">
        {/* TOC */}
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
              <p>Need clarification?</p>
              <Link to="/contact" className="toc-contact-btn">Contact Us</Link>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="legal-content">
          <div className="legal-intro-card">
            <p>
              These Terms of Service ("Terms") govern your use of the <strong>KaryON</strong> platform, including our
              website and mobile application. By accessing or using the Platform, you agree to be bound by these Terms.
              If you do not agree, please do not use our Platform.
            </p>
          </div>

          {/* Section 1 */}
          <section id="acceptance" className="legal-section">
            <div className="section-header">
              <span className="section-icon">✅</span>
              <h2>1. Acceptance of Terms</h2>
            </div>
            <p>
              By accessing or using the KaryON Platform, you confirm that you have read, understood, and agree to be
              bound by these Terms of Service and our Privacy Policy, which is incorporated by reference. These Terms
              apply to all visitors, users, and others who access the Platform.
            </p>
            <p>
              We reserve the right to update these Terms at any time. Continued use of the Platform after changes
              constitutes your acceptance of the revised Terms. We will provide at least 14 days' notice for material changes.
            </p>
          </section>

          {/* Section 2 */}
          <section id="eligibility" className="legal-section">
            <div className="section-header">
              <span className="section-icon">🪪</span>
              <h2>2. Eligibility</h2>
            </div>
            <p>To use the KaryON Platform, you must:</p>
            <ul className="legal-list">
              <li>Be at least 18 years of age or have parental/guardian consent.</li>
              <li>Have the legal capacity to enter into binding contracts.</li>
              <li>Not be prohibited from using the Platform under applicable laws.</li>
              <li>Provide accurate, current, and complete information during registration.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="account" className="legal-section">
            <div className="section-header">
              <span className="section-icon">👤</span>
              <h2>3. Account Registration</h2>
            </div>
            <p>
              You must create an account to access most features of the Platform. You agree to:
            </p>
            <ul className="legal-list">
              <li>Provide accurate and complete registration information.</li>
              <li>Keep your password confidential and not share it with others.</li>
              <li>Notify us immediately of any unauthorized use of your account.</li>
              <li>Be responsible for all activity that occurs under your account.</li>
            </ul>
            <div className="highlight-box">
              <span className="highlight-icon">⚠️</span>
              <p>KaryON is not liable for any loss resulting from unauthorized account access due to your failure to keep login credentials secure.</p>
            </div>
          </section>

          {/* Section 4 */}
          <section id="services" className="legal-section">
            <div className="section-header">
              <span className="section-icon">🔧</span>
              <h2>4. Our Services</h2>
            </div>
            <p>
              KaryON is a marketplace platform that connects customers with independent service professionals.
              KaryON does not directly provide home services; it facilitates connections between customers and professionals.
            </p>
            <div className="use-grid">
              {[
                { icon: '🧹', title: 'Home Cleaning', desc: 'Deep cleaning, regular cleaning, and post-construction cleanup.' },
                { icon: '🔩', title: 'Plumbing', desc: 'Pipe repairs, installations, and emergency plumbing.' },
                { icon: '⚡', title: 'Electrical', desc: 'Wiring, installations, repairs, and safety inspections.' },
                { icon: '🎨', title: 'Painting', desc: 'Interior, exterior, and decorative painting services.' },
                { icon: '📚', title: 'Tutoring', desc: 'Academic tutoring for K-12 and competitive exams.' },
                { icon: '🚚', title: 'Moving', desc: 'Packing, shifting, and relocation services.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="use-card">
                  <span className="use-icon">{icon}</span>
                  <h4>{title}</h4>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
            <p style={{ marginTop: '16px' }}>
              Service availability varies by location. KaryON reserves the right to add, modify, or discontinue services at any time.
            </p>
          </section>

          {/* Section 5 */}
          <section id="booking" className="legal-section">
            <div className="section-header">
              <span className="section-icon">💳</span>
              <h2>5. Booking &amp; Payments</h2>
            </div>
            <h3>5.1 Booking Process</h3>
            <ul className="legal-list">
              <li>Bookings are confirmed only after receiving a confirmation notification from KaryON.</li>
              <li>You must provide accurate information including address, preferred time, and service details.</li>
              <li>Cancellations made less than 2 hours before the scheduled time may incur a cancellation fee.</li>
            </ul>
            <h3>5.2 Pricing &amp; Payment</h3>
            <ul className="legal-list">
              <li>Service prices are displayed at the time of booking and are subject to change.</li>
              <li>Payment must be made through the Platform's approved payment methods.</li>
              <li>All prices are inclusive of applicable taxes unless stated otherwise.</li>
              <li>KaryON charges a platform service fee on each transaction.</li>
            </ul>
            <h3>5.3 Refunds</h3>
            <p>
              Refunds are processed within 5–7 business days for eligible claims. Contact us within 24 hours of
              service completion to raise a dispute. See our full Refund Policy for details.
            </p>
          </section>

          {/* Section 6 */}
          <section id="conduct" className="legal-section">
            <div className="section-header">
              <span className="section-icon">🤝</span>
              <h2>6. User Conduct</h2>
            </div>
            <p>You agree not to:</p>
            <ul className="legal-list">
              <li>Use the Platform for any unlawful, fraudulent, or abusive purpose.</li>
              <li>Harass, threaten, or harm any professional or KaryON staff.</li>
              <li>Attempt to circumvent the Platform by contacting professionals directly to avoid fees.</li>
              <li>Post false reviews or manipulate the rating system.</li>
              <li>Use automated tools, bots, or scrapers without written permission.</li>
              <li>Upload malicious code, viruses, or harmful content.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section id="professionals" className="legal-section">
            <div className="section-header">
              <span className="section-icon">👷</span>
              <h2>7. Professionals</h2>
            </div>
            <p>
              Service professionals on KaryON are independent contractors, not employees of KaryON. While we verify
              credentials and conduct background checks, KaryON does not guarantee the quality, safety, or legality
              of services provided.
            </p>
            <p>
              If you register as a professional on KaryON, you additionally agree to:
            </p>
            <ul className="legal-list">
              <li>Provide accurate information about your skills, certifications, and experience.</li>
              <li>Deliver services in a professional, safe, and timely manner.</li>
              <li>Comply with all applicable laws and safety standards.</li>
              <li>Maintain appropriate licenses and insurance as required by law.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section id="ip" className="legal-section">
            <div className="section-header">
              <span className="section-icon">©️</span>
              <h2>8. Intellectual Property</h2>
            </div>
            <p>
              All content on the Platform, including logos, trademarks, text, graphics, and software, is the exclusive
              property of KaryON and protected by applicable intellectual property laws.
            </p>
            <p>
              You may not reproduce, distribute, modify, or create derivative works without prior written consent from KaryON.
              Any feedback or suggestions you provide may be used by KaryON without compensation or attribution.
            </p>
          </section>

          {/* Section 9 */}
          <section id="liability" className="legal-section">
            <div className="section-header">
              <span className="section-icon">⚖️</span>
              <h2>9. Limitation of Liability</h2>
            </div>
            <p>
              To the fullest extent permitted by applicable law, KaryON and its affiliates, officers, and employees
              shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising
              from your use of the Platform or services.
            </p>
            <div className="highlight-box">
              <span className="highlight-icon">📌</span>
              <p>KaryON's total liability for any claim arising under these Terms shall not exceed the amount you paid to KaryON in the 3 months preceding the claim.</p>
            </div>
          </section>

          {/* Section 10 */}
          <section id="termination" className="legal-section">
            <div className="section-header">
              <span className="section-icon">🚫</span>
              <h2>10. Termination</h2>
            </div>
            <p>
              KaryON reserves the right to suspend or terminate your account at any time for violation of these Terms,
              fraudulent activity, or behavior harmful to the community, without prior notice.
            </p>
            <p>
              You may delete your account at any time through the Settings page. Deletion is subject to completion of
              any pending bookings and outstanding payments.
            </p>
          </section>

          {/* Section 11 */}
          <section id="governing" className="legal-section">
            <div className="section-header">
              <span className="section-icon">🏛️</span>
              <h2>11. Governing Law</h2>
            </div>
            <p>
              These Terms are governed by and construed in accordance with the laws of India. Any disputes arising
              from these Terms shall be subject to the exclusive jurisdiction of courts located in Kanpur, Uttar Pradesh, India.
            </p>
            <p>
              Any disputes shall first be attempted to be resolved through good-faith negotiation. If unresolved,
              disputes shall be referred to binding arbitration in accordance with the Arbitration and Conciliation Act, 1996.
            </p>
          </section>

          {/* Section 12 */}
          <section id="contact" className="legal-section">
            <div className="section-header">
              <span className="section-icon">📩</span>
              <h2>12. Contact</h2>
            </div>
            <p>For questions about these Terms, contact our legal team:</p>
            <div className="contact-card-grid">
              <div className="contact-card-item">
                <span>📧</span>
                <a href="mailto:legal@karyon.com">legal@karyon.com</a>
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
            <p>Explore other policies?</p>
            <div className="legal-cta-buttons">
              <Link to="/privacy" className="legal-cta-btn primary">Privacy Policy</Link>
              <Link to="/faq" className="legal-cta-btn secondary">FAQ</Link>
              <Link to="/contact" className="legal-cta-btn secondary">Contact Us</Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TermsOfService;
