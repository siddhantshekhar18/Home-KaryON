import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Painting.css';
import { bookingsAPI } from '../../api';

const Painting = () => {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [counterValues, setCounterValues] = useState({
    painters: 0,
    projects: 0,
    clients: 0,
    colors: 0
  });
  
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: '',
    roomSize: '',
    date: '',
    time: '',
    address: '',
    colorPreference: '',
    surfaceType: '',
    additionalNotes: ''
  });

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);
const [activeColorPalette, setActiveColorPalette] = useState('popular');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const statsRef = useRef(null);
  const parallaxRef = useRef(null);

  // Counter Animation
  useEffect(() => {
    const targets = {
      painters: 300,
      projects: 8500,
      clients: 7500,
      colors: 1500
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const interval = setInterval(() => {
              setCounterValues(prev => {
                const newValues = { ...prev };
                let completed = true;
                
                Object.keys(targets).forEach(key => {
                  if (prev[key] < targets[key]) {
                    completed = false;
                    newValues[key] = Math.min(prev[key] + Math.ceil(targets[key] / 50), targets[key]);
                  }
                });
                
                if (completed) clearInterval(interval);
                return newValues;
              });
            }, 30);

            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Parallax Effect
  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrolled = window.scrollY;
        parallaxRef.current.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Painting Services Data
  const paintingServices = [
    { 
      icon: "🏠", 
      title: "Interior Painting", 
      description: "Professional interior painting for walls, ceilings, and trim",
      price: "From ₹299/room",
      features: ["Premium paints", "Clean finish", "Color consultation"],
      color: "#667eea"
    },
    { 
      icon: "🌳", 
      title: "Exterior Painting", 
      description: "Weather-resistant exterior painting for lasting protection",
      price: "From ₹999",
      features: ["Weather proof", "5-year warranty", "Pressure wash"],
      color: "#fc7f03"
    },
    { 
      icon: "🎨", 
      title: "Cabinet Painting", 
      description: "Transform your cabinets with professional painting",
      price: "From ₹399",
      features: ["Smooth finish", "Durable coating", "Hardware included"],
      color: "#502222"
    },
    { 
      icon: "🖌️", 
      title: "Wallpaper Removal", 
      description: "Expert wallpaper removal and wall preparation",
      price: "From ₹199",
      features: ["Steam removal", "Wall repair", "Smooth finish"],
      color: "#667eea"
    },
    { 
      icon: "✨", 
      title: "Texture Painting", 
      description: "Decorative texture finishes for unique walls",
      price: "From ₹349",
      features: ["Multiple textures", "Design patterns", "Custom effects"],
      color: "#fc7f03"
    },
    { 
      icon: "🏢", 
      title: "Commercial Painting", 
      description: "Professional painting for offices and commercial spaces",
      price: "Custom Quote",
      features: ["Minimal disruption", "After hours", "Fast completion"],
      color: "#502222"
    },
    { 
      icon: "🪑", 
      title: "Furniture Painting", 
      description: "Give old furniture new life with professional painting",
      price: "From ₹149",
      features: ["Chalk paint", "Antique finish", "Sealing"],
      color: "#667eea"
    },
    { 
      icon: "🎭", 
      title: "Faux Finishes", 
      description: "Artistic faux finishing for accent walls",
      price: "From ₹449",
      features: ["Marble effect", "Wood grain", "Metallic"],
      color: "#fc7f03"
    }
  ];

  // Color Palettes
  const colorPalettes = {
    popular: [
      { name: "Ocean Breeze", code: "#4a90e2", category: "Blue" },
      { name: "Sage Green", code: "#9caf88", category: "Green" },
      { name: "Warm Beige", code: "#f5e6d3", category: "Neutral" },
      { name: "Terracotta", code: "#e27d60", category: "Warm" },
      { name: "Slate Gray", code: "#708090", category: "Gray" },
      { name: "Cream White", code: "#fdf5e6", category: "White" }
    ],
    modern: [
      { name: "Charcoal", code: "#36454F", category: "Dark" },
      { name: "Blush Pink", code: "#f7cac9", category: "Pastel" },
      { name: "Navy Blue", code: "#001f3f", category: "Dark" },
      { name: "Mustard", code: "#ffdb58", category: "Warm" },
      { name: "Emerald", code: "#50c878", category: "Green" },
      { name: "Lavender", code: "#e6e6fa", category: "Pastel" }
    ],
    classic: [
      { name: "Pure White", code: "#ffffff", category: "White" },
      { name: "Ivory", code: "#fffff0", category: "White" },
      { name: "Taupe", code: "#483c32", category: "Brown" },
      { name: "Burgundy", code: "#800020", category: "Red" },
      { name: "Forest Green", code: "#228b22", category: "Green" },
      { name: "Navy", code: "#000080", category: "Blue" }
    ]
  };

  // Project Types
  const projectTypes = [
    { value: "interior", label: "Interior Painting" },
    { value: "exterior", label: "Exterior Painting" },
    { value: "room", label: "Single Room" },
    { value: "whole-house", label: "Whole House" },
    { value: "cabinet", label: "Cabinet Painting" },
    { value: "furniture", label: "Furniture" },
    { value: "commercial", label: "Commercial" },
    { value: "other", label: "Other" }
  ];

  // Room Sizes
  const roomSizes = [
    { value: "small", label: "Small (up to 100 sq ft)" },
    { value: "medium", label: "Medium (100-200 sq ft)" },
    { value: "large", label: "Large (200-400 sq ft)" },
    { value: "xlarge", label: "Extra Large (400+ sq ft)" },
    { value: "whole", label: "Whole House" }
  ];

  // Surface Types
  const surfaceTypes = [
    { value: "drywall", label: "Drywall" },
    { value: "plaster", label: "Plaster" },
    { value: "wood", label: "Wood" },
    { value: "brick", label: "Brick" },
    { value: "concrete", label: "Concrete" },
    { value: "metal", label: "Metal" },
    { value: "previously-painted", label: "Previously Painted" }
  ];

  // Testimonials Data
  const testimonials = [
    {
      name: "Jennifer Lawrence",
      role: "Homeowner",
      content: "The painting team transformed my living room! Professional, clean, and the color matching was perfect. Highly recommended!",
      rating: 5,
      image: "👩"
    },
    {
      name: "David Thompson",
      role: "Property Investor",
      content: "Used them for multiple properties. Great attention to detail, fair pricing, and always completed on schedule.",
      rating: 5,
      image: "👨"
    },
    {
      name: "Maria Garcia",
      role: "Interior Designer",
      content: "As a designer, I'm picky about paint work. These guys exceeded expectations. Will definitely use again.",
      rating: 5,
      image: "👩‍🎨"
    }
  ];

  // FAQs
  const faqs = [
    {
      q: "How long does painting take?",
      a: "Average room takes 1-2 days. Whole house typically 3-5 days depending on size."
    },
    {
      q: "Do I need to move furniture?",
      a: "We'll cover and protect all furniture. You can leave everything in place."
    },
    {
      q: "What paint brands do you use?",
      a: "We use premium brands like Benjamin Moore, Sherwin-Williams, and Behr."
    },
    {
      q: "Do you provide color consultation?",
      a: "Yes! Free color consultation with all our painting services."
    },
    {
      q: "Is the paint eco-friendly?",
      a: "We offer low-VOC and zero-VOC eco-friendly paint options."
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const projectLabel = projectTypes.find(type => type.value === bookingForm.projectType)?.label || 'Painting Project';

      const bookingData = {
        customer: {
          name: bookingForm.name,
          email: bookingForm.email,
          phone: bookingForm.phone
        },
        service: {
          type: 'Painting',
          name: projectLabel,
          description: bookingForm.additionalNotes || `${projectLabel} (${bookingForm.roomSize || 'custom size'})`,
          subService: bookingForm.projectType
        },
        schedule: {
          date: bookingForm.date,
          time: bookingForm.time,
          isEmergency: false
        },
        address: {
          street: bookingForm.address,
          city: '',
          zipCode: ''
        },
        pricing: {
          basePrice: 0,
          currency: 'INR'
        }
      };

      const response = await bookingsAPI.create(bookingData);

      if (response.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setShowBookingForm(false);
          setFormStep(1);
          setBookingForm({
            name: '', email: '', phone: '', projectType: '', roomSize: '',
            date: '', time: '', address: '', colorPreference: '', surfaceType: '', additionalNotes: ''
          });
          setSubmitSuccess(false);
          navigate('/bookings');
        }, 1500);
      }
    } catch (error) {
      setSubmitError(error.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setFormStep(prev => prev + 1);
  const prevStep = () => setFormStep(prev => prev - 1);

  return (
    <div className="painting">
      {/* Hero Section with Parallax */}
      <section className="painting-hero">
        <div className="painting-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`painting-particle particle-${i + 1}`}></div>
          ))}
        </div>
        
        <div className="painting-hero-background" ref={parallaxRef}>
          <div className="painting-hero-gradient"></div>
          <div className="painting-hero-pattern"></div>
        </div>

        <div className="painting-hero-container">
          <div className="painting-hero-content">
            <div className="painting-hero-badge">
              <span className="badge-pulse"></span>
              <span className="badge-text">Professional Painters • Free Color Consultation</span>
            </div>
            
            <h1 className="painting-hero-title">
              <span className="title-line">Expert</span>
              <span className="title-highlight">Painting Services</span>
            </h1>
            
            <p className="painting-hero-description">
              Transform your space with professional painting. From interior walls to exterior facades,
              our skilled painters deliver flawless finishes every time.
            </p>

            <div className="painting-hero-cta">
              <button 
                className="cta-btn-primary"
                onClick={() => setShowBookingForm(true)}
              >
                <span>Get Free Quote</span>
                <span className="btn-icon">→</span>
                <div className="btn-shine"></div>
              </button>
              
              <button className="cta-btn-secondary">
                <span className="btn-play-icon">🎨</span>
                <span>Color Consultation</span>
              </button>
            </div>

            <div className="painting-hero-stats">
              <div className="stat-item">
                <span className="stat-number">5+</span>
                <span className="stat-label">Years Exp</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Satisfaction</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">2yr</span>
                <span className="stat-label">Warranty</span>
              </div>
            </div>
          </div>

          <div className="painting-hero-visual">
            <div className="painting-floating-card card-1">
              <span className="card-icon">🎨</span>
              <div className="card-text">
                <strong>Color Match</strong>
                <span>Free consultation</span>
              </div>
            </div>
            <div className="painting-floating-card card-2">
              <span className="card-icon">⭐</span>
              <div className="card-text">
                <strong>4.9 Rating</strong>
                <span>2k+ reviews</span>
              </div>
            </div>
            <div className="painting-floating-card card-3">
              <span className="card-icon">🖌️</span>
              <div className="card-text">
                <strong>Premium</strong>
                <span>Paint included</span>
              </div>
            </div>
            
            <div className="painting-hero-image-wrapper">
              <div className="painting-hero-image-glow"></div>
              <div className="painting-hero-image">
                <div className="painting-hero-image-content">
                  <span className="main-emoji">🎨</span>
                  <span className="paint-splash-1">💫</span>
                  <span className="paint-splash-2">✨</span>
                  <span className="paint-splash-3">🖌️</span>
                  <span className="paint-splash-4">🌈</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="painting-hero-wave">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,42.7C960,43,1056,53,1152,58.7C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Color Consultation Banner */}
      

      {/* Services Section */}
      <section className="painting-services">
        <div className="painting-services-container">
          <div className="section-header">
            <span className="section-subtitle">What We Offer</span>
            <h2 className="section-title">
              Our <span className="title-accent">Painting</span> Services
            </h2>
            <p className="section-description">
              Professional painting solutions for every surface, backed by expertise and guarantees
            </p>
          </div>

          <div className="painting-services-grid">
            {paintingServices.map((service, index) => (
              <div key={index} className="painting-service-card" style={{ '--card-color': service.color }}>
                <div className="service-icon-wrapper">
                  <span className="service-icon">{service.icon}</span>
                  <div className="icon-glow"></div>
                </div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
                <div className="service-price">{service.price}</div>
                <ul className="service-features">
                  {service.features.map((feature, idx) => (
                    <li key={idx}>
                      <span className="feature-check">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  className="service-book"
                  onClick={() => setShowBookingForm(true)}
                >
                  Get Quote →
                </button>
                <div className="paint-drip"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Color Palette Showcase */}
      <section className="color-palette-section">
        <div className="color-palette-container">
          <div className="section-header light">
            <span className="section-subtitle">Inspiration</span>
            <h2 className="section-title">
              Popular <span className="title-accent">Color</span> Palettes
            </h2>
            <p className="section-description">
              Explore trending colors and find the perfect shade for your space
            </p>
          </div>

          <div className="palette-tabs">
            <button 
              className={`palette-tab ${activeColorPalette === 'popular' ? 'active' : ''}`}
              onClick={() => setActiveColorPalette('popular')}
            >
              Popular
            </button>
            <button 
              className={`palette-tab ${activeColorPalette === 'modern' ? 'active' : ''}`}
              onClick={() => setActiveColorPalette('modern')}
            >
              Modern
            </button>
            <button 
              className={`palette-tab ${activeColorPalette === 'classic' ? 'active' : ''}`}
              onClick={() => setActiveColorPalette('classic')}
            >
              Classic
            </button>
          </div>

          <div className="color-grid">
            {colorPalettes[activeColorPalette].map((color, index) => (
              <div 
                key={index} 
                className="color-card"
                onClick={() => setSelectedColor(color)}
                style={{ '--color-code': color.code }}
              >
                <div className="color-preview" style={{ backgroundColor: color.code }}>
                  <div className="color-overlay">
                    <span className="color-name">{color.name}</span>
                    <span className="color-code">{color.code}</span>
                  </div>
                </div>
                <div className="color-info">
                  <h4>{color.name}</h4>
                  <p>{color.category}</p>
                </div>
              </div>
            ))}
          </div>

          {selectedColor && (
            <div className="selected-color-modal" onClick={() => setSelectedColor(null)}>
              <div className="selected-color-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setSelectedColor(null)}>×</button>
                <div className="selected-color-preview" style={{ backgroundColor: selectedColor.code }}></div>
                <div className="selected-color-details">
                  <h3>{selectedColor.name}</h3>
                  <p>Code: {selectedColor.code}</p>
                  <p>Category: {selectedColor.category}</p>
                  <button 
                    className="use-color-btn"
                    onClick={() => {
                      setBookingForm(prev => ({ ...prev, colorPreference: selectedColor.name }));
                      setSelectedColor(null);
                      setShowBookingForm(true);
                    }}
                  >
                    Use This Color
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="painting-stats" ref={statsRef}>
        <div className="painting-stats-background">
          <div className="painting-stats-pattern"></div>
        </div>

        <div className="painting-stats-container">
          <div className="painting-stats-grid">
            <div className="stats-card">
              <div className="stats-icon">👨‍🎨</div>
              <div className="stats-content">
                <span className="stats-number">{counterValues.painters}+</span>
                <span className="stats-label">Expert Painters</span>
              </div>
              <div className="stats-progress"></div>
            </div>

            <div className="stats-card">
              <div className="stats-icon">🏠</div>
              <div className="stats-content">
                <span className="stats-number">{counterValues.projects.toLocaleString()}+</span>
                <span className="stats-label">Projects Done</span>
              </div>
              <div className="stats-progress"></div>
            </div>

            <div className="stats-card">
              <div className="stats-icon">👥</div>
              <div className="stats-content">
                <span className="stats-number">{counterValues.clients.toLocaleString()}+</span>
                <span className="stats-label">Happy Clients</span>
              </div>
              <div className="stats-progress"></div>
            </div>

            <div className="stats-card">
              <div className="stats-icon">🎨</div>
              <div className="stats-content">
                <span className="stats-number">{counterValues.colors}+</span>
                <span className="stats-label">Colors Available</span>
              </div>
              <div className="stats-progress"></div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      

      {/* Testimonials */}
      <section className="painting-testimonials">
        <div className="painting-testimonials-container">
          <div className="section-header">
            <span className="section-subtitle">Client Feedback</span>
            <h2 className="section-title">
              What Our <span className="title-accent">Customers</span> Say
            </h2>
          </div>

          <div className="testimonials-slider">
            <div className="testimonial-card">
              <div className="quote-icon">"</div>
              <p className="testimonial-text">{testimonials[activeTestimonial].content}</p>
              
              <div className="testimonial-rating">
                {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                  <span key={i} className="star">★</span>
                ))}
              </div>

              <div className="testimonial-author">
                <div className="author-avatar">{testimonials[activeTestimonial].image}</div>
                <div className="author-info">
                  <h4>{testimonials[activeTestimonial].name}</h4>
                  <p>{testimonials[activeTestimonial].role}</p>
                </div>
              </div>
            </div>

            <div className="testimonial-controls">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`control-btn ${activeTestimonial === index ? 'active' : ''}`}
                  onClick={() => setActiveTestimonial(index)}
                >
                  <span></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="painting-faq">
        <div className="faq-container">
          <div className="section-header">
            <span className="section-subtitle">FAQ</span>
            <h2 className="section-title">
              Common <span className="title-accent">Questions</span>
            </h2>
          </div>

          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <div className="faq-question">
                  <h3>{faq.q}</h3>
                  <span className="faq-icon">?</span>
                </div>
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {showBookingForm && (
        <div className="booking-modal-overlay" onClick={() => setShowBookingForm(false)}>
          <div className="booking-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowBookingForm(false)}>×</button>
            
            <div className="modal-header">
              <h2>Get Free Painting Quote</h2>
              <p>Tell us about your project and we'll provide an estimate</p>
            </div>

            <div className="booking-progress">
              <div className={`progress-step ${formStep >= 1 ? 'active' : ''}`}>
                <span className="step-num">1</span>
                <span className="step-label">Project</span>
              </div>
              <div className={`progress-step ${formStep >= 2 ? 'active' : ''}`}>
                <span className="step-num">2</span>
                <span className="step-label">Details</span>
              </div>
              <div className={`progress-step ${formStep >= 3 ? 'active' : ''}`}>
                <span className="step-num">3</span>
                <span className="step-label">Contact</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="booking-form">
              {formStep === 1 && (
                <div className="form-step">
                  <div className="form-group">
                    <label>Project Type *</label>
                    <select
                      name="projectType"
                      value={bookingForm.projectType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select project type</option>
                      {projectTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Room/Area Size *</label>
                    <select
                      name="roomSize"
                      value={bookingForm.roomSize}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select size</option>
                      {roomSizes.map(size => (
                        <option key={size.value} value={size.value}>{size.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Surface Type *</label>
                    <select
                      name="surfaceType"
                      value={bookingForm.surfaceType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select surface type</option>
                      {surfaceTypes.map(surface => (
                        <option key={surface.value} value={surface.value}>{surface.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Color Preference (Optional)</label>
                    <input
                      type="text"
                      name="colorPreference"
                      value={bookingForm.colorPreference}
                      onChange={handleInputChange}
                      placeholder="e.g., Ocean Breeze or any color"
                    />
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn-next" onClick={nextStep}>
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {formStep === 2 && (
                <div className="form-step">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Preferred Date *</label>
                      <input
                        type="date"
                        name="date"
                        value={bookingForm.date}
                        onChange={handleInputChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="form-group">
                      <label>Preferred Time *</label>
                      <select
                        name="time"
                        value={bookingForm.time}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select time</option>
                        <option value="8-12">8:00 AM - 12:00 PM</option>
                        <option value="12-4">12:00 PM - 4:00 PM</option>
                        <option value="4-8">4:00 PM - 8:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Additional Notes</label>
                    <textarea
                      name="additionalNotes"
                      value={bookingForm.additionalNotes}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Any special requirements or details about your project..."
                    ></textarea>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn-prev" onClick={prevStep}>
                      ← Back
                    </button>
                    <button type="button" className="btn-next" onClick={nextStep}>
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {formStep === 3 && (
                <div className="form-step">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={bookingForm.name}
                        onChange={handleInputChange}
                        required
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={bookingForm.email}
                        onChange={handleInputChange}
                        required
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={bookingForm.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div className="form-group">
                      <label>Address *</label>
                      <input
                        type="text"
                        name="address"
                        value={bookingForm.address}
                        onChange={handleInputChange}
                        required
                        placeholder="Street address, city, zip"
                      />
                    </div>
                  </div>

                  <div className="booking-summary">
                    <h3>Project Summary</h3>
                    <div className="summary-item">
                      <span>Project:</span>
                      <strong>{projectTypes.find(t => t.value === bookingForm.projectType)?.label || 'Not selected'}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Size:</span>
                      <strong>{roomSizes.find(s => s.value === bookingForm.roomSize)?.label || 'Not selected'}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Date:</span>
                      <strong>{bookingForm.date || 'Not selected'}</strong>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn-prev" onClick={prevStep}>
                      ← Edit
                    </button>
                    <button type="submit" className="btn-submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Get Free Quote →'}
                    </button>
                  </div>
                  {submitError && <p style={{ color: '#c62828', marginTop: '12px' }}>{submitError}</p>}
                  {submitSuccess && <p style={{ color: '#2e7d32', marginTop: '12px' }}>Booking created successfully. Redirecting...</p>}
                </div>
              )}
            </form>

            <div className="modal-footer">
              <span className="secure-badge">🔒 100% Free Quote</span>
              <span className="guarantee-badge">✓ No Obligation</span>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="painting-cta">
        <div className="painting-cta-background">
          <div className="cta-bubble bubble-1"></div>
          <div className="cta-bubble bubble-2"></div>
          <div className="cta-bubble bubble-3"></div>
        </div>

        <div className="painting-cta-container">
          <div className="painting-cta-content">
            <h2 className="painting-cta-title">
              Ready to Transform Your Space?
            </h2>
            <p className="painting-cta-description">
              Get a free, no-obligation quote today. Professional painters, premium materials, guaranteed satisfaction.
            </p>

            <div className="painting-cta-buttons">
              <button 
                className="cta-primary"
                onClick={() => setShowBookingForm(true)}
              >
                <span>Get Free Quote</span>
                <span className="cta-icon">→</span>
                <div className="cta-shine"></div>
              </button>

              <button className="cta-secondary">
                <span className="phone-icon">📞</span>
                <span>Call: (888) 555-0456</span>
              </button>
            </div>

            <div className="painting-cta-features">
              <span>✓ Free Consultation</span>
              <span>✓ Premium Paints</span>
              <span>✓ 2-Year Warranty</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Painting;