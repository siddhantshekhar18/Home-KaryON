import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { newsletterAPI } from '../../api';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterAgreed, setNewsletterAgreed] = useState(false);
  const [newsletterStatus, setNewsletterStatus] = useState(null); // 'success' | 'error' | null
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setNewsletterStatus(null);
    setNewsletterMessage('');

    if (!newsletterAgreed) {
      setNewsletterStatus('error');
      setNewsletterMessage('Please agree to the Privacy Policy and Terms of Service.');
      return;
    }

    setNewsletterLoading(true);
    try {
      const response = await newsletterAPI.subscribe(newsletterEmail, newsletterAgreed);
      setNewsletterStatus('success');
      setNewsletterMessage(response.message);
      setNewsletterEmail('');
      setNewsletterAgreed(false);
    } catch (error) {
      setNewsletterStatus('error');
      setNewsletterMessage(error.message || 'Something went wrong. Please try again.');
    } finally {
      setNewsletterLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="footer">
      {/* Wave SVG Divider */}
      <div className="footer-wave">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120">
          <path 
            fill="rgba(102, 126, 234, 0.1)" 
            fillOpacity="1" 
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
          ></path>
        </svg>
      </div>

      <div className="footer-content">
        <div className="footer-container">
          {/* Main Footer Grid */}
          <div className="footer-grid">
            
            {/* Company Info Section */}
            <div className="footer-section company-info">
              <div className="footer-logo">
                <img src="/main-logo.png" alt="KaryON Logo" width="170px" height="57px"></img>
              </div>
              <p className="company-description">
                KaryON makes home services simple, secure, and reliable. Connect with verified professionals for all your home service needs.
              </p>
              <div className="social-links">
                <a href="#" className="social-link facebook" aria-label="Facebook">
                  <svg className="social-icon" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.891 3.777-3.891 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </a>
                <a href="#" className="social-link twitter" aria-label="X (Twitter)">
                  <svg className="social-icon" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.213 5.567zM17.083 20.25h1.833L6.98 4.126H5.017z"/>
                  </svg>
                </a>
                <a href="#" className="social-link instagram" aria-label="Instagram">
                  <svg className="social-icon" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="social-link linkedin" aria-label="LinkedIn">
                  <svg className="social-icon" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links Section */}
            <div className="footer-section">
              <h3 className="footer-title">Quick Links</h3>
              <ul className="footer-links">
                <li><a href="/"><span className="link-arrow">→</span> Home</a></li>
                <li><a href="/services"><span className="link-arrow">→</span> Services</a></li>
                <li><a href="/howitworks"><span className="link-arrow">→</span> How It Works</a></li>
                <li><a href="/about"><span className="link-arrow">→</span> About Us</a></li>
                <li><a href="/contact"><span className="link-arrow">→</span> Contact</a></li>
                <li><a href="/blog"><span className="link-arrow">→</span> Blog</a></li>
              </ul>
            </div>

            {/* Services Section */}
            <div className="footer-section">
              <h3 className="footer-title">Our Services</h3>
              <ul className="footer-links">
                <li><a href="/cleaning"><span className="link-arrow">→</span> Home Cleaning</a></li>
                <li><a href="/plumbing"><span className="link-arrow">→</span> Plumbing</a></li>
                <li><a href="/electrician"><span className="link-arrow">→</span> Electrical</a></li>
                <li><a href="/tutoring"><span className="link-arrow">→</span> Tutoring</a></li>
                <li><a href="/painting"><span className="link-arrow">→</span> Painting</a></li>
                <li><a href="/moving"><span className="link-arrow">→</span> Moving & Shifting</a></li>
                <li><Link to="/services" className="view-all">View All Services <span className="view-all-icon">→</span></Link></li>
              </ul>
            </div>

            {/* Contact Section */}
            <div className="footer-section">
              <h3 className="footer-title">Get In Touch</h3>
              <div className="contact-info">
                <a className="contact-item contact-link" href="tel:+919305724440" aria-label="Call KaryON support">
                  <span className="contact-icon-wrap" aria-hidden="true">
                    <svg className="contact-icon" viewBox="0 0 24 24" fill="none">
                      <path d="M5 4.5a2.5 2.5 0 0 1 2.8-2.48 3 3 0 0 1 2.36 1.94l.62 2.08a2.2 2.2 0 0 1-.53 2.18L8.95 9.56a13 13 0 0 0 5.5 5.5l1.34-1.3a2.2 2.2 0 0 1 2.18-.54l2.08.62a3 3 0 0 1 1.94 2.36A2.5 2.5 0 0 1 19.5 19H18a13 13 0 0 1-13-13V4.5z" />
                    </svg>
                  </span>
                  <span>+91 93057 24440</span>
                </a>
                <a
                  className="contact-item contact-link"
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=support@karyon.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Email KaryON support"
                  title="Send email to support@karyon.app"
                >
                  <span className="contact-icon-wrap" aria-hidden="true">
                    <svg className="contact-icon" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="5" width="18" height="14" rx="2.5" />
                      <path d="M4.5 7l7.5 5.4L19.5 7" />
                    </svg>
                  </span>
                  <span>support@karyon.app</span>
                </a>
                <a
                  className="contact-item contact-link"
                  href="https://www.google.com/maps/search/?api=1&query=Rooma+Kanpur"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open KaryON location in Google Maps"
                >
                  <span className="contact-icon-wrap" aria-hidden="true">
                    <svg className="contact-icon" viewBox="0 0 24 24" fill="none">
                      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z" />
                      <circle cx="12" cy="10" r="2.6" />
                    </svg>
                  </span>
                  <span>Rooma, Kanpur</span>
                </a>
                <div className="contact-item">
                  <span className="contact-icon-wrap" aria-hidden="true">
                    <svg className="contact-icon" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7.5v5l3.4 2" />
                    </svg>
                  </span>
                  <span>Mon - Sun: 8:00 AM - 10:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="newsletter-section">
            <div className="newsletter-content">
              <h3 className="newsletter-title">Subscribe to Our Newsletter</h3>
              <p className="newsletter-text">Get the latest updates on new services and special offers</p>
              {newsletterStatus === 'success' ? (
                <div className="newsletter-success">
                  <span className="newsletter-success-icon">✅</span>
                  <p>{newsletterMessage}</p>
                </div>
              ) : (
                <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                  <div className="input-group">
                    <input
                      type="email"
                      className="newsletter-input"
                      placeholder="Enter your email address"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      required
                    />
                    <button type="submit" className="newsletter-btn" disabled={newsletterLoading}>
                      {newsletterLoading ? 'Subscribing...' : 'Subscribe'}
                      {!newsletterLoading && (
                        <svg className="btn-icon" viewBox="0 0 24 24">
                          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {newsletterStatus === 'error' && (
                    <p className="newsletter-error">{newsletterMessage}</p>
                  )}
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={newsletterAgreed}
                      onChange={(e) => setNewsletterAgreed(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    I agree to the <Link to="/privacy">Privacy Policy</Link> and <Link to="/terms">Terms of Service</Link>
                  </label>
                </form>
              )}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="footer-bottom">
            <div className="bottom-content">
              <div className="copyright">
                <span className="copyright-symbol">©</span> {currentYear} KaryON. All rights reserved.
              </div>
              
              <div className="bottom-links">
                <Link to="/privacy" className="bottom-link">Privacy Policy</Link>
                <span className="link-separator">•</span>
                <Link to="/terms" className="bottom-link">Terms of Service</Link>
                <span className="link-separator">•</span>
                <Link to="/sitemap" className="bottom-link">Sitemap</Link>
                <span className="link-separator">•</span>
                <Link to="/faq" className="bottom-link">FAQ</Link>
              </div>

              <div className="payment-methods">
                <span className="payment-label">We Accept:</span>
                <div className="payment-icons">
                  {/* Visa */}
                  <svg className="payment-icon" viewBox="0 0 60 38" xmlns="http://www.w3.org/2000/svg" aria-label="Visa">
                    <rect width="60" height="38" rx="5" fill="#1A1F71"/>
                    <text x="30" y="26" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="900" fontStyle="italic" fontSize="19" fill="white" letterSpacing="1">VISA</text>
                  </svg>
                  {/* Mastercard */}
                  <svg className="payment-icon" viewBox="0 0 60 38" xmlns="http://www.w3.org/2000/svg" aria-label="Mastercard">
                    <rect width="60" height="38" rx="5" fill="#1D1D1B"/>
                    <circle cx="23" cy="19" r="10" fill="#EB001B"/>
                    <circle cx="37" cy="19" r="10" fill="#F79E1B"/>
                    <path d="M30,11.86 A10,10,0,0,1,30,26.14 A10,10,0,0,0,30,11.86Z" fill="#FF5F00"/>
                  </svg>
                  {/* UPI */}
                  <svg className="payment-icon" viewBox="0 0 60 38" xmlns="http://www.w3.org/2000/svg" aria-label="UPI">
                    <rect width="60" height="38" rx="5" fill="white"/>
                    <rect x="0.5" y="0.5" width="59" height="37" rx="4.5" fill="none" stroke="#e2e8f0" strokeWidth="1"/>
                    <text x="9" y="26" fontFamily="Arial,sans-serif" fontWeight="900" fontSize="17" fill="#6B3FA0">U</text>
                    <text x="23" y="26" fontFamily="Arial,sans-serif" fontWeight="900" fontSize="17" fill="#097939">P</text>
                    <text x="38" y="26" fontFamily="Arial,sans-serif" fontWeight="900" fontSize="17" fill="#0066B3">I</text>
                  </svg>
                  {/* RuPay */}
                  <svg className="payment-icon" viewBox="0 0 60 38" xmlns="http://www.w3.org/2000/svg" aria-label="RuPay">
                    <rect width="60" height="38" rx="5" fill="#003087"/>
                    <text x="30" y="16" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="10" fill="#f7c948">RUPAY</text>
                    <rect x="8" y="20" width="44" height="3" rx="1.5" fill="#f7c948" opacity="0.6"/>
                    <text x="30" y="32" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="7" fill="#a0b4d0">INDIA</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button 
        className="back-to-top" 
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <svg className="top-icon" viewBox="0 0 24 24">
          <path d="M12 19V5M5 12l7-7 7 7"/>
        </svg>
      </button>
    </footer>
  );
};

export default Footer;