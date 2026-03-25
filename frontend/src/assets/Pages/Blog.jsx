import React, { useState } from 'react';
import './Blog.css';

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [likedPosts, setLikedPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);

  // Categories Data
  const categories = [
    { id: 'all', name: 'All Posts', icon: '📰', count: 24 },
    { id: 'plumbing', name: 'Plumbing', icon: '🔧', count: 4 },
    { id: 'electrical', name: 'Electrical', icon: '⚡', count: 3 },
    { id: 'cleaning', name: 'Cleaning', icon: '🧹', count: 5 },
    { id: 'painting', name: 'Painting', icon: '🎨', count: 3 },
    { id: 'gardening', name: 'Gardening', icon: '🌱', count: 4 },
    { id: 'diy', name: 'DIY Tips', icon: '🛠️', count: 6 },
    { id: 'maintenance', name: 'Maintenance', icon: '🔨', count: 4 }
  ];

  // Blog Posts Data
  const blogPosts = [
    {
      id: 1,
      title: "10 Essential Plumbing Tips Every Homeowner Should Know",
      excerpt: "From fixing a leaky faucet to preventing frozen pipes, these plumbing tips will save you time and money.",
      content: "Plumbing issues can be a nightmare for homeowners. In this comprehensive guide, we'll cover everything from basic maintenance to emergency repairs. Learn how to identify common problems, when to DIY vs call a professional, and essential tools every home should have...",
      author: "John Anderson",
      authorRole: "Master Plumber",
      authorImage: "👨‍🔧",
      date: "Mar 15, 2024",
      readTime: "8 min read",
      category: "plumbing",
      image: "🔧",
      tags: ["plumbing", "diy", "maintenance"],
      likes: 234,
      comments: 45,
      featured: true,
      color: "#667eea"
    },
    {
      id: 2,
      title: "Electrical Safety: A Complete Guide for Homeowners",
      excerpt: "Stay safe with these essential electrical safety tips and know when to call a professional electrician.",
      content: "Electricity is essential but can be dangerous. This guide covers circuit breaker basics, outlet safety, surge protection, and signs of electrical problems. Learn how to prevent electrical fires and when to upgrade your home's electrical system...",
      author: "Sarah Martinez",
      authorRole: "Licensed Electrician",
      authorImage: "👩‍🔧",
      date: "Mar 12, 2024",
      readTime: "6 min read",
      category: "electrical",
      image: "⚡",
      tags: ["electrical", "safety", "maintenance"],
      likes: 189,
      comments: 32,
      featured: true,
      color: "#fc7f03"
    },
    {
      id: 3,
      title: "Spring Cleaning Checklist: Deep Clean Your Home",
      excerpt: "Get your home sparkling clean with our comprehensive spring cleaning checklist and expert tips.",
      content: "Spring is the perfect time for a deep clean. Our room-by-room guide covers everything from kitchen appliances to window treatments. Plus, eco-friendly cleaning solutions and time-saving techniques from professional cleaners...",
      author: "Emily Rodriguez",
      authorRole: "Cleaning Expert",
      authorImage: "👩",
      date: "Mar 10, 2024",
      readTime: "10 min read",
      category: "cleaning",
      image: "🧹",
      tags: ["cleaning", "spring", "organization"],
      likes: 312,
      comments: 67,
      featured: true,
      color: "#502222"
    },
    {
      id: 4,
      title: "Transform Your Home with These Painting Tips",
      excerpt: "Professional painting secrets to give your walls a flawless finish and transform any room.",
      content: "Painting is one of the most cost-effective ways to transform your home. Learn about paint types, color selection, prep work, and techniques for perfect edges. Plus, common mistakes to avoid and tools every DIY painter needs...",
      author: "Michael Chen",
      authorRole: "Painting Specialist",
      authorImage: "👨‍🎨",
      date: "Mar 8, 2024",
      readTime: "7 min read",
      category: "painting",
      image: "🎨",
      tags: ["painting", "diy", "home improvement"],
      likes: 156,
      comments: 28,
      featured: false,
      color: "#667eea"
    },
    {
      id: 5,
      title: "Gardening 101: A Beginner's Guide to a Beautiful Garden",
      excerpt: "Start your gardening journey with these essential tips for soil, planting, and maintenance.",
      content: "Whether you have a green thumb or are just starting, this guide covers everything from soil preparation to plant selection. Learn about seasonal planting, watering techniques, pest control, and creating a sustainable garden...",
      author: "Lisa Thompson",
      authorRole: "Master Gardener",
      authorImage: "👩‍🌾",
      date: "Mar 5, 2024",
      readTime: "9 min read",
      category: "gardening",
      image: "🌱",
      tags: ["gardening", "outdoor", "plants"],
      likes: 278,
      comments: 54,
      featured: true,
      color: "#fc7f03"
    },
    {
      id: 6,
      title: "HVAC Maintenance: Extend the Life of Your System",
      excerpt: "Regular maintenance can double the life of your HVAC system. Here's what you need to know.",
      content: "Your HVAC system works hard year-round. Learn about filter changes, seasonal inspections, thermostat optimization, and signs that indicate repair needs. Plus, energy-saving tips and when to consider replacement...",
      author: "David Kim",
      authorRole: "HVAC Technician",
      authorImage: "👨‍🔧",
      date: "Mar 3, 2024",
      readTime: "6 min read",
      category: "maintenance",
      image: "❄️",
      tags: ["hvac", "maintenance", "energy"],
      likes: 145,
      comments: 23,
      featured: false,
      color: "#502222"
    },
    {
      id: 7,
      title: "DIY Home Repairs You Can Do This Weekend",
      excerpt: "Fix common household issues yourself with these simple DIY repair guides.",
      content: "From squeaky doors to loose cabinet handles, many home repairs are easier than you think. This guide covers essential tools, step-by-step instructions for common fixes, and when to call a professional. Save money and gain confidence...",
      author: "James Wilson",
      authorRole: "Handyman",
      authorImage: "👨",
      date: "Feb 28, 2024",
      readTime: "8 min read",
      category: "diy",
      image: "🛠️",
      tags: ["diy", "repairs", "weekend projects"],
      likes: 423,
      comments: 89,
      featured: true,
      color: "#667eea"
    },
    {
      id: 8,
      title: "Water Damage Prevention: Protect Your Home",
      excerpt: "Learn how to identify water damage risks and prevent costly repairs.",
      content: "Water damage is one of the most common and expensive home issues. This guide covers leak detection, roof maintenance, gutter cleaning, and signs of hidden water damage. Plus, what to do in case of flooding or burst pipes...",
      author: "Robert Johnson",
      authorRole: "Plumbing Expert",
      authorImage: "👨‍🔧",
      date: "Feb 25, 2024",
      readTime: "7 min read",
      category: "plumbing",
      image: "💧",
      tags: ["plumbing", "prevention", "maintenance"],
      likes: 167,
      comments: 31,
      featured: false,
      color: "#fc7f03"
    }
  ];

  // Featured Posts
  const featuredPosts = blogPosts.filter(post => post.featured);

  // Filter posts based on category and search
  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Popular Posts (by likes)
  const popularPosts = [...blogPosts].sort((a, b) => b.likes - a.likes).slice(0, 3);

  // Recent Posts
  const _recentPosts = [...blogPosts].slice(0, 4);

  const handleLike = (postId) => {
    setLikedPosts(prev => 
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  const handleSave = (postId) => {
    setSavedPosts(prev => 
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  const handleShare = (post) => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="blog-page">
      {/* Hero Section */}
      <section className="blog-hero">
        <div className="blog-hero-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`blog-particle particle-${i + 1}`}></div>
          ))}
        </div>

        <div className="blog-hero-content">
          <div className="hero-badge">
            <span className="badge-pulse"></span>
            KaryON Blog
          </div>

          <h1 className="blog-hero-title">
            <span className="title-line">Tips & Advice for</span>
            <span className="title-highlight">Your Home</span>
          </h1>

          <p className="blog-hero-description">
            Expert insights, DIY guides, and professional advice to help you maintain and improve your home
          </p>

          <div className="hero-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="hero-search-input"
            />
          </div>
        </div>

        <div className="blog-hero-wave">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,42.7C960,43,1056,53,1152,58.7C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Categories Section */}
      <section className="blog-categories">
        <div className="categories-container">
          <div className="categories-slider">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-chip ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
                <span className="category-count">{category.count}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {activeCategory === 'all' && !searchTerm && (
        <section className="featured-posts">
          <div className="featured-container">
            <div className="section-header">
              <span className="section-badge">Editor's Pick</span>
              <h2 className="section-title">
                Featured <span className="title-accent">Articles</span>
              </h2>
            </div>

            <div className="featured-grid">
              {featuredPosts.map(post => (
                <div key={post.id} className="featured-card" style={{ '--post-color': post.color }}>
                  <div className="featured-image">
                    <span className="featured-emoji">{post.image}</span>
                  </div>
                  <div className="featured-content">
                    <div className="featured-meta">
                      <span className="featured-category">{post.category}</span>
                      <span className="featured-date">{post.date}</span>
                    </div>
                    <h3 className="featured-title">{post.title}</h3>
                    <p className="featured-excerpt">{post.excerpt}</p>
                    <div className="featured-author">
                      <div className="author-avatar">{post.authorImage}</div>
                      <div className="author-info">
                        <span className="author-name">{post.author}</span>
                        <span className="author-role">{post.authorRole}</span>
                      </div>
                    </div>
                    <div className="featured-stats">
                      <span className="stat">
                        <span className="stat-icon">⏱️</span>
                        {post.readTime}
                      </span>
                      <span className="stat">
                        <span className="stat-icon">❤️</span>
                        {post.likes}
                      </span>
                      <span className="stat">
                        <span className="stat-icon">💬</span>
                        {post.comments}
                      </span>
                    </div>
                    <button className="featured-read-btn" onClick={() => setSelectedPost(post)}>
                      Read Article
                      <span className="btn-icon">→</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Blog Grid */}
      <section className="blog-grid-section">
        <div className="blog-container">
          <div className="blog-layout">
            {/* Main Content */}
            <div className="blog-main">
              <div className="section-header">
                <h2 className="section-title">
                  {activeCategory === 'all' ? 'Latest ' : categories.find(c => c.id === activeCategory)?.name + ' '}
                  <span className="title-accent">Articles</span>
                </h2>
                <p className="section-description">
                  {filteredPosts.length} articles found
                </p>
              </div>

              <div className="posts-grid">
                {filteredPosts.map(post => (
                  <div key={post.id} className="post-card" style={{ '--post-color': post.color }}>
                    <div className="post-image">
                      <span className="post-emoji">{post.image}</span>
                      <div className="post-category-tag">{post.category}</div>
                    </div>
                    
                    <div className="post-content">
                      <div className="post-meta">
                        <span className="post-date">{post.date}</span>
                        <span className="post-read-time">{post.readTime}</span>
                      </div>
                      
                      <h3 className="post-title">{post.title}</h3>
                      <p className="post-excerpt">{post.excerpt}</p>
                      
                      <div className="post-footer">
                        <div className="post-author">
                          <span className="author-avatar-small">{post.authorImage}</span>
                          <span className="author-name-small">{post.author}</span>
                        </div>
                        
                        <div className="post-actions">
                          <button 
                            className={`action-btn like-btn ${likedPosts.includes(post.id) ? 'active' : ''}`}
                            onClick={() => handleLike(post.id)}
                          >
                            ❤️ {post.likes + (likedPosts.includes(post.id) ? 1 : 0)}
                          </button>
                          <button 
                            className={`action-btn save-btn ${savedPosts.includes(post.id) ? 'active' : ''}`}
                            onClick={() => handleSave(post.id)}
                          >
                            {savedPosts.includes(post.id) ? '📌' : '📑'}
                          </button>
                          <button 
                            className="action-btn share-btn"
                            onClick={() => handleShare(post)}
                          >
                            🔗
                          </button>
                        </div>
                      </div>

                      <button className="post-read-more" onClick={() => setSelectedPost(post)}>
                        Read More
                        <span className="btn-icon">→</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              {filteredPosts.length > 0 && (
                <div className="load-more">
                  <button className="load-more-btn">
                    <span>Load More Articles</span>
                    <span className="btn-icon">↓</span>
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="blog-sidebar">
              {/* Search Widget */}
              <div className="sidebar-widget search-widget">
                <h3 className="widget-title">Search</h3>
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <span className="search-icon">🔍</span>
                </div>
              </div>

              {/* Categories Widget */}
              <div className="sidebar-widget categories-widget">
                <h3 className="widget-title">Categories</h3>
                <ul className="category-list">
                  {categories.map(category => (
                    <li key={category.id}>
                      <button
                        className={`category-item ${activeCategory === category.id ? 'active' : ''}`}
                        onClick={() => setActiveCategory(category.id)}
                      >
                        <span className="category-icon">{category.icon}</span>
                        <span className="category-name">{category.name}</span>
                        <span className="category-count">{category.count}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Popular Posts Widget */}
              <div className="sidebar-widget popular-widget">
                <h3 className="widget-title">Popular Posts</h3>
                <div className="popular-list">
                  {popularPosts.map(post => (
                    <div key={post.id} className="popular-item" onClick={() => setSelectedPost(post)}>
                      <span className="popular-emoji">{post.image}</span>
                      <div className="popular-info">
                        <h4 className="popular-title">{post.title}</h4>
                        <div className="popular-meta">
                          <span>❤️ {post.likes}</span>
                          <span>💬 {post.comments}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Newsletter Widget */}
              <div className="sidebar-widget newsletter-widget">
                <h3 className="widget-title">Newsletter</h3>
                <p className="newsletter-text">
                  Get the latest home maintenance tips delivered to your inbox
                </p>
                <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                  <input
                    type="email"
                    placeholder="Your email"
                    className="newsletter-input"
                  />
                  <button type="submit" className="newsletter-btn">
                    Subscribe
                  </button>
                </form>
              </div>

              {/* Tags Widget */}
              <div className="sidebar-widget tags-widget">
                <h3 className="widget-title">Popular Tags</h3>
                <div className="tags-cloud">
                  {['plumbing', 'diy', 'cleaning', 'electrical', 'gardening', 'maintenance', 'painting', 'safety', 'tools', 'organization'].map(tag => (
                    <button
                      key={tag}
                      className="tag-btn"
                      onClick={() => setSearchTerm(tag)}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="blog-newsletter">
        <div className="newsletter-container">
          <div className="newsletter-content">
            <h2 className="newsletter-title">
              Never Miss an <span className="title-accent">Article</span>
            </h2>
            <p className="newsletter-description">
              Join our community of 10,000+ homeowners who receive weekly tips and exclusive content
            </p>
            <form className="newsletter-large-form">
              <input
                type="email"
                placeholder="Enter your email address"
                className="newsletter-large-input"
              />
              <button type="submit" className="newsletter-large-btn">
                Subscribe
                <span className="btn-icon">→</span>
              </button>
            </form>
            <p className="newsletter-note">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Modal */}
      {selectedPost && (
        <div className="blog-modal" onClick={() => setSelectedPost(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPost(null)}>×</button>
            
            <div className="modal-header" style={{ '--modal-color': selectedPost.color }}>
              <span className="modal-emoji">{selectedPost.image}</span>
              <div className="modal-header-text">
                <h2 className="modal-title">{selectedPost.title}</h2>
                <div className="modal-meta">
                  <span className="modal-category">{selectedPost.category}</span>
                  <span className="modal-date">{selectedPost.date}</span>
                  <span className="modal-read-time">{selectedPost.readTime}</span>
                </div>
              </div>
            </div>

            <div className="modal-body">
              <div className="modal-author">
                <div className="author-avatar-large">{selectedPost.authorImage}</div>
                <div className="author-details">
                  <h4>{selectedPost.author}</h4>
                  <p>{selectedPost.authorRole}</p>
                </div>
              </div>

              <div className="modal-content-text">
                <p className="modal-excerpt">{selectedPost.excerpt}</p>
                <p className="modal-full-content">{selectedPost.content}</p>
              </div>

              <div className="modal-tags">
                {selectedPost.tags.map(tag => (
                  <span key={tag} className="modal-tag">#{tag}</span>
                ))}
              </div>

              <div className="modal-actions">
                <div className="modal-stats">
                  <span>❤️ {selectedPost.likes + (likedPosts.includes(selectedPost.id) ? 1 : 0)}</span>
                  <span>💬 {selectedPost.comments}</span>
                  <span>📌 {savedPosts.includes(selectedPost.id) ? 'Saved' : 'Save'}</span>
                </div>
                <div className="modal-share">
                  <button className="share-btn" onClick={() => handleShare(selectedPost)}>🔗 Share</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;