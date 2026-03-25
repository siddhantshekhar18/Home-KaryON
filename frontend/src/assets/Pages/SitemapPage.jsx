import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SitemapPage.css';

const siteStructure = [
  {
    category: 'Main Pages',
    icon: '🏠',
    color: '#667eea',
    pages: [
      { name: 'Home', path: '/', desc: 'KaryON home — trusted home services platform.' },
      { name: 'Services', path: '/services', desc: 'Browse all available home services.' },
      { name: 'How It Works', path: '/howitworks', desc: 'Learn how KaryON connects you with professionals.' },
      { name: 'About Us', path: '/about', desc: 'Our mission, team, and story.' },
      { name: 'Blog', path: '/blog', desc: 'Home care tips and expert advice.' },
      { name: 'Contact Us', path: '/contact', desc: 'Get in touch with KaryON support.' },
    ],
  },
  {
    category: 'Services',
    icon: '🔧',
    color: '#fc7f03',
    pages: [
      { name: 'Home Cleaning', path: '/cleaning', desc: 'Professional cleaning for every corner of your home.' },
      { name: 'Plumbing', path: '/plumbing', desc: 'Certified plumbers for repairs and installations.' },
      { name: 'Electrical', path: '/electrician', desc: 'Qualified electricians for safe, reliable work.' },
      { name: 'Painting', path: '/painting', desc: 'Interior and exterior painting by skilled painters.' },
      { name: 'Tutoring', path: '/tutoring', desc: 'Academic tutors for all levels and subjects.' },
      { name: 'Moving & Shifting', path: '/moving', desc: 'Stress-free relocation and packing services.' },
    ],
  },
  {
    category: 'Account',
    icon: '👤',
    color: '#502222',
    pages: [
      { name: 'Sign Up', path: '/signup', desc: 'Create your free KaryON account.' },
      { name: 'Login', path: '/login', desc: 'Access your KaryON account.' },
      { name: 'My Profile', path: '/profile', desc: 'View and update your profile details.' },
      { name: 'My Bookings', path: '/bookings', desc: 'Track and manage all your bookings.' },
      { name: 'Settings', path: '/settings', desc: 'Manage your account preferences.' },
      { name: 'Professional Dashboard', path: '/professional', desc: 'View assigned jobs and manage work.' },
    ],
  },
  {
    category: 'Legal & Info',
    icon: '📋',
    color: '#4caf50',
    pages: [
      { name: 'Privacy Policy', path: '/privacy', desc: 'How we collect, use, and protect your data.' },
      { name: 'Terms of Service', path: '/terms', desc: 'Rules and agreements for using our Platform.' },
      { name: 'FAQ', path: '/faq', desc: 'Answers to the most frequently asked questions.' },
      { name: 'Sitemap', path: '/sitemap', desc: 'Full directory of all pages on KaryON.' },
    ],
  },
];

const SitemapPage = () => {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? siteStructure
        .map((cat) => ({
          ...cat,
          pages: cat.pages.filter(
            (p) =>
              p.name.toLowerCase().includes(search.toLowerCase()) ||
              p.desc.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter((cat) => cat.pages.length > 0)
    : siteStructure;

  const totalPages = siteStructure.reduce((acc, c) => acc + c.pages.length, 0);

  return (
    <div className="sitemap-page">
      {/* Hero */}
      <div className="sitemap-hero">
        <div className="sitemap-hero-particles">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`sitemap-particle sitemap-particle-${i + 1}`} />
          ))}
        </div>
        <div className="sitemap-hero-content">
          <div className="sitemap-badge">
            <span>🗺️</span>
            <span>Site Directory</span>
          </div>
          <h1 className="sitemap-hero-title">Sitemap</h1>
          <p className="sitemap-hero-subtitle">
            Explore every page on the KaryON platform — organized, searchable, and accessible.
          </p>
          <div className="sitemap-stats">
            <div className="stat-pill">
              <span className="stat-num">{totalPages}</span>
              <span>Total Pages</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num">{siteStructure.length}</span>
              <span>Categories</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="sitemap-search-wrap">
        <div className="sitemap-search-box">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search pages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sitemap-search-input"
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>
        {search && (
          <p className="search-results-note">
            Showing {filtered.reduce((a, c) => a + c.pages.length, 0)} result(s) for "<strong>{search}</strong>"
          </p>
        )}
      </div>

      {/* Sitemap Grid */}
      <div className="sitemap-main">
        <div className="sitemap-container">
          {filtered.length === 0 ? (
            <div className="no-results">
              <span className="no-results-icon">🔍</span>
              <h3>No pages found</h3>
              <p>Try a different search term.</p>
              <button className="sitemap-btn" onClick={() => setSearch('')}>Clear Search</button>
            </div>
          ) : (
            <div className="sitemap-grid">
              {filtered.map(({ category, icon, color, pages }) => (
                <div key={category} className="sitemap-category-card" style={{ '--cat-color': color }}>
                  <div className="cat-header">
                    <span className="cat-icon">{icon}</span>
                    <h2 className="cat-title">{category}</h2>
                    <span className="cat-count">{pages.length} pages</span>
                  </div>
                  <ul className="cat-pages">
                    {pages.map(({ name, path, desc }) => (
                      <li key={path} className="cat-page-item">
                        <Link to={path} className="cat-page-link">
                          <div className="page-link-inner">
                            <span className="page-arrow">→</span>
                            <div>
                              <span className="page-name">{name}</span>
                              <span className="page-desc">{desc}</span>
                            </div>
                          </div>
                          <span className="page-path">{path}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Bottom CTA */}
          <div className="sitemap-cta">
            <p>Can't find what you're looking for?</p>
            <div className="sitemap-cta-buttons">
              <Link to="/contact" className="sitemap-cta-btn primary">Contact Support</Link>
              <Link to="/faq" className="sitemap-cta-btn secondary">Browse FAQ</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SitemapPage;
