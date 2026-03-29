import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import './BookingModal.css';
import { bookingsAPI } from '../../api';

const FALLBACK_STATS = {
  customers: 50000,
  professionals: 1500,
  services: 5000,
  cities: 25
};

const Home = () => {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [statsTargets, setStatsTargets] = useState(FALLBACK_STATS);
  const [statsReady, setStatsReady] = useState(false);
  const [counterValues, setCounterValues] = useState({
    customers: 0,
    professionals: 0,
    services: 0,
    cities: 0
  });
  
  // Booking modal state
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const emptyForm = { name: '', email: '', phone: '', date: '', time: '', address: '', city: '', problemDesc: '', emergency: false };
  const [bookingForm, setBookingForm] = useState(emptyForm);

  // Open modal fresh — resets all state
  const openBookingModal = (serviceType = '') => {
    setSelectedService(serviceType);
    setBookingForm(emptyForm);
    setSubmitError('');
    setSubmitSuccess(false);
    setShowBookingForm(true);
  };
  
  const statsRef = useRef(null);
  const parallaxRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadHomeStats = async () => {
      try {
        const response = await bookingsAPI.getHomeStats();
        const stats = response?.stats || {};

        const nextTargets = {
          customers: Number.isFinite(Number(stats.customers)) ? Math.max(0, Number(stats.customers)) : FALLBACK_STATS.customers,
          professionals: Number.isFinite(Number(stats.professionals)) ? Math.max(0, Number(stats.professionals)) : FALLBACK_STATS.professionals,
          services: Number.isFinite(Number(stats.services)) ? Math.max(0, Number(stats.services)) : FALLBACK_STATS.services,
          cities: Number.isFinite(Number(stats.cities)) ? Math.max(0, Number(stats.cities)) : FALLBACK_STATS.cities
        };

        if (isMounted) {
          setStatsTargets(nextTargets);
          setStatsReady(true);
        }
      } catch {
        if (isMounted) {
          setStatsTargets(FALLBACK_STATS);
          setStatsReady(true);
        }
      }
    };

    loadHomeStats();

    return () => {
      isMounted = false;
    };
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') setShowBookingForm(false); };
    if (showBookingForm) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showBookingForm]);

  // Counter Animation
  useEffect(() => {
    if (!statsReady) {
      return undefined;
    }

    const targets = statsTargets;

    setCounterValues({
      customers: 0,
      professionals: 0,
      services: 0,
      cities: 0
    });

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
  }, [statsReady, statsTargets]);

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

  // Testimonials Data
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Homeowner",
      content: "The plumbing service was exceptional! The professional arrived on time and fixed the issue quickly. Highly recommended!",
      rating: 5,
      image: "👩"
    },
    {
      name: "Michael Chen",
      role: "Property Manager",
      content: "I've used their electrical services for multiple properties. Always reliable, professional, and fairly priced.",
      rating: 5,
      image: "👨"
    },
    {
      name: "Emily Rodriguez",
      role: "New Homeowner",
      content: "From cleaning to painting, every service has been top-notch. They've become my go-to for all home needs.",
      rating: 5,
      image: "👩‍🦱"
    }
  ];

// Services Data - with serviceType for booking
  const services = [
    { icon: "🔧", title: "Plumbing", description: "Expert plumbing solutions for leaks, installations, and repairs", color: "#667eea", serviceType: "Plumbing" },
    { icon: "⚡", title: "Electrical", description: "Certified electricians for wiring, fixtures, and safety checks", color: "#fc7f03", serviceType: "Electrical" },
    { icon: "🪚", title: "Carpentry", description: "Custom furniture, repairs, and woodwork masterpieces", color: "#502222", serviceType: "Carpentry" },
    { icon: "🧹", title: "Cleaning", description: "Deep cleaning, sanitization, and maintenance services", color: "#667eea", serviceType: "Cleaning" },
    { icon: "🎨", title: "Painting", description: "Interior and exterior painting with premium finishes", color: "#fc7f03", serviceType: "Painting" },
    { icon: "❄️", title: "HVAC", description: "Heating and cooling installation, repair, and maintenance", color: "#502222", serviceType: "HVAC" },
    { icon: "📦", title: "Moving", description: "Professional moving and packing services", color: "#667eea", serviceType: "Moving" },
    { icon: "🌱", title: "Gardening", description: "Landscaping, lawn care, and garden maintenance", color: "#fc7f03", serviceType: "Gardening" },
    { icon: "📚", title: "Tutoring", description: "Expert tutoring and educational support services", color: "#667eea", serviceType: "Tutoring" },
    { icon: "🔨", title: "Handyman", description: "General handyman services and repairs", color: "#fc7f03", serviceType: "Handyman" }
  ];

  const handleServiceClick = (service) => {
    openBookingModal(service.serviceType);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Frontend validation
    if (!selectedService) {
      setSubmitError('Please select a service.');
      return;
    }
    const cleanPhone = bookingForm.phone.replace(/\D/g, '');
    if (!/^\d{6,15}$/.test(cleanPhone)) {
      setSubmitError('Please enter a valid phone number (digits only, 6–15 characters).');
      return;
    }
    if (!bookingForm.date) {
      setSubmitError('Please select a date.');
      return;
    }
    const pickedDate = new Date(bookingForm.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (pickedDate < today) {
      setSubmitError('Please select a present or future date.');
      return;
    }
    if (!bookingForm.time) {
      setSubmitError('Please select a time.');
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingData = {
        customer: {
          name: bookingForm.name.trim(),
          email: bookingForm.email.toLowerCase().trim(),
          phone: cleanPhone
        },
        service: {
          type: selectedService,
          name: selectedService + ' Service',
          description: bookingForm.problemDesc.trim() || 'General service request',
          subService: ''
        },
        schedule: {
          date: bookingForm.date,
          time: bookingForm.time,
          isEmergency: bookingForm.emergency
        },
        address: {
          street: bookingForm.address.trim(),
          city: bookingForm.city.trim(),
          zipCode: ''
        },
        pricing: { basePrice: 0, currency: 'INR' }
      };

      const response = await bookingsAPI.create(bookingData);

      if (response.success) {
        setSubmitSuccess(true);
        localStorage.setItem('lastBookingEmail', bookingForm.email);
        setTimeout(() => {
          setShowBookingForm(false);
          setBookingForm(emptyForm);
          setSelectedService('');
          setSubmitSuccess(false);
          navigate('/bookings');
        }, 2000);
      } else {
        setSubmitError(response.message || 'Failed to create booking. Please try again.');
      }
    } catch (error) {
      console.error('Booking error:', error);
      setSubmitError(error.message || 'Could not connect to server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // How It Works Data
  const steps = [
    { number: "01", icon: "📱", title: "Book Service", description: "Choose your service and schedule a convenient time", color: "#667eea" },
    { number: "02", icon: "👨‍🔧", title: "Get Matched", description: "We connect you with the best professional for the job", color: "#fc7f03" },
    { number: "03", icon: "✅", title: "Service Done", description: "Professional completes the work with quality assurance", color: "#502222" }
  ];

  return (
    <div className="home">
      {/* Hero Section with Parallax */}
      <section className="hero-section">
        <div className="hero-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}></div>
          ))}
        </div>
        
        <div className="hero-background" ref={parallaxRef}>
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>

        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-pulse"></span>
              Trusted by 50,000+ Happy Customers
            </div>
            
            <h1 className="hero-title">
              <span className="title-line">Professional Home Services</span>
              <span className="title-highlight">At Your Doorstep</span>
            </h1>
            
            <p className="hero-description">
              From plumbing to painting, connect with verified professionals 
              for all your home service needs. Book now and get 10% off!
            </p>

<div className="hero-cta">
              <button 
                className="cta-btn-primary" 
                onClick={() => openBookingModal('')}
                title="Click to book any service"
              >
                <span>Book a Service</span>
                <span className="btn-icon">→</span>
                <div className="btn-shine"></div>
              </button>
              
              <button className="cta-btn-secondary" onClick={() => navigate('/howitworks')}>
                <span className="btn-play-icon">▶</span>
                <span>How It Works</span>
              </button>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Happy Clients</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">1.5K+</span>
                <span className="stat-label">Professionals</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">25+</span>
                <span className="stat-label">Cities</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="floating-card card-1">
              <span className="card-icon">🔧</span>
              <span>24/7 Support</span>
            </div>
            <div className="floating-card card-2">
              <span className="card-icon">⭐</span>
              <span>4.9 Rating</span>
            </div>
            <div className="floating-card card-3">
              <span className="card-icon">⚡</span>
              <span>Quick Response</span>
            </div>
            
            <div className="hero-image-wrapper">
              <div className="hero-image-glow"></div>
              <div className="hero-image">
                <div className="hero-image-content">
                  <span className="main-emoji">🏠</span>
                  <span className="service-emoji-1">🔧</span>
                  <span className="service-emoji-2">⚡</span>
                  <span className="service-emoji-3">🪚</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-wave">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,42.7C960,43,1056,53,1152,58.7C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="services-container">
          <div className="section-header">
            <span className="section-subtitle">What We Offer</span>
            <h2 className="section-title">
              Our <span className="title-accent">Premium</span> Services
            </h2>
            <p className="section-description">
              Choose from a wide range of professional home services tailored to your needs
            </p>
          </div>

          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card-wrapper">
                <div className="service-card" style={{ '--card-color': service.color }}>
                  <div className="card-inner">
<div className="card-front" onClick={() => handleServiceClick(service)} style={{ cursor: 'pointer' }}>
                      <div className="service-icon-wrapper">
                        <span className="service-icon">{service.icon}</span>
                        <div className="icon-glow"></div>
                      </div>
                      <h3 className="service-title">{service.title}</h3>
                      <p className="service-description">{service.description}</p>
                      <button className="front-book-btn" onClick={(e) => { e.stopPropagation(); handleServiceClick(service); }}>Book Now</button>
                      <div className="service-hover-indicator"></div>
                    </div>
                    <div className="card-back">
                      <span className="back-icon">✨</span>
                      <h4>Book Now</h4>
                      <p>Get 10% off on first service</p>
<button className="back-btn" onClick={() => handleServiceClick(service)}>Book →</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

<div className="services-cta">
            <button className="view-all-btn" onClick={() => navigate('/services')}>
              <span>View All Services</span>
              <span className="btn-arrow">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section" ref={statsRef}>
        <div className="stats-background">
          <div className="stats-pattern"></div>
        </div>

        <div className="stats-container">
          <div className="stats-grid">
            <div className="stats-card">
              <div className="stats-icon">👥</div>
              <div className="stats-content">
                <span className="stats-number">{counterValues.customers.toLocaleString()}+</span>
                <span className="stats-label">Happy Customers</span>
              </div>
              <div className="stats-progress"></div>
            </div>

            <div className="stats-card">
              <div className="stats-icon">👨‍🔧</div>
              <div className="stats-content">
                <span className="stats-number">{counterValues.professionals}+</span>
                <span className="stats-label">Expert Pros</span>
              </div>
              <div className="stats-progress"></div>
            </div>

            <div className="stats-card">
              <div className="stats-icon">🛠️</div>
              <div className="stats-content">
                <span className="stats-number">{counterValues.services}+</span>
                <span className="stats-label">Services Done</span>
              </div>
              <div className="stats-progress"></div>
            </div>

            <div className="stats-card">
              <div className="stats-icon">🏙️</div>
              <div className="stats-content">
                <span className="stats-number">{counterValues.cities}+</span>
                <span className="stats-label">Cities Covered</span>
              </div>
              <div className="stats-progress"></div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="works-container">
          <div className="section-header light">
            <span className="section-subtitle">Simple Process</span>
            <h2 className="section-title">
              How It <span className="title-accent">Works</span>
            </h2>
            <p className="section-description">
              Get your home service in three simple steps
            </p>
          </div>

          <div className="steps-container">
            {steps.map((step, index) => (
              <div key={index} className="step-wrapper">
                <div className="step-card" style={{ '--step-color': step.color }}>
                  <div className="step-number">{step.number}</div>
                  <div className="step-icon">{step.icon}</div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="step-connector">
                    <span className="connector-dot"></span>
                    <span className="connector-line"></span>
                    <span className="connector-dot"></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="testimonials-container">
          <div className="section-header">
            <span className="section-subtitle">Client Feedback</span>
            <h2 className="section-title">
              What Our <span className="title-accent">Customers</span> Say
            </h2>
          </div>

          <div className="testimonials-slider">
            <div className="testimonial-main">
              <div className="testimonial-content">
                <div className="quote-icon">"</div>
                <p className="testimonial-text">{testimonials[activeTestimonial].content}</p>
                
                <div className="testimonial-rating">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <span key={i} className="star-filled">★</span>
                  ))}
                </div>

                <div className="testimonial-author">
                  <div className="author-avatar">
                    <span className="avatar-emoji">{testimonials[activeTestimonial].image}</span>
                  </div>
                  <div className="author-info">
                    <h4>{testimonials[activeTestimonial].name}</h4>
                    <p>{testimonials[activeTestimonial].role}</p>
                  </div>
                </div>
              </div>

              <div className="testimonial-pattern"></div>
            </div>

            <div className="testimonial-controls">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`control-dot ${activeTestimonial === index ? 'active' : ''}`}
                  onClick={() => setActiveTestimonial(index)}
                >
                  <span className="dot-inner"></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-background">
          <div className="cta-bubble bubble-1"></div>
          <div className="cta-bubble bubble-2"></div>
          <div className="cta-bubble bubble-3"></div>
        </div>

        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title">
              Ready to Transform Your Home?
            </h2>
            <p className="cta-description">
              Join thousands of happy customers who trust us for their home service needs
            </p>

<div className="cta-buttons">
              <button 
                className="cta-primary" 
                onClick={() => openBookingModal('')}
                title="Click to book any service"
              >
                <span>Book a Service Now</span>
                <span className="cta-icon">→</span>
                <div className="cta-shine"></div>
              </button>

              <button className="cta-secondary" onClick={() => window.location.href = 'tel:+1234567890'}>
                <span className="phone-icon">📞</span>
                <span>Call Us: +1 (234) 567-890</span>
              </button>
            </div>

            <div className="cta-guarantee">
              <span className="guarantee-icon">✓</span>
              <span>100% Satisfaction Guaranteed</span>
            </div>
          </div>

          <div className="cta-image">
            <div className="cta-card">
              <span className="cta-card-icon">🏆</span>
              <div className="cta-card-text">
                <strong>5+ Years</strong>
                <span>of Excellence</span>
              </div>
            </div>
</div>
        </div>
      </section>

      {/* Booking Modal */}
      {showBookingForm && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowBookingForm(false); }}>
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowBookingForm(false)} aria-label="Close">×</button>
            <h2>{selectedService ? `Book ${selectedService} Service` : 'Book a Service'}</h2>
            <form onSubmit={handleSubmit} noValidate>

              <div className="form-group">
                <label>Select Service <span className="req">*</span></label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  required
                >
                  <option value="">— Choose a service —</option>
                  {services.map((service, index) => (
                    <option key={index} value={service.serviceType}>
                      {service.icon}  {service.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Full Name <span className="req">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={bookingForm.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Ravi Sharma"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone <span className="req">*</span></label>
                  <input
                    type="tel"
                    name="phone"
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, phone: e.target.value.replace(/[^0-9+\-\s]/g, '') }))}
                    placeholder="e.g. 9876543210"
                    maxLength={15}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email <span className="req">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={bookingForm.email}
                  onChange={handleInputChange}
                  placeholder="e.g. ravi@email.com"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date <span className="req">*</span></label>
                  <input
                    type="date"
                    name="date"
                    value={bookingForm.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Time <span className="req">*</span></label>
                  <select
                    name="time"
                    value={bookingForm.time}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">— Select time —</option>
                    <option value="07:00">7:00 AM</option>
                    <option value="08:00">8:00 AM</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="17:00">5:00 PM</option>
                    <option value="18:00">6:00 PM</option>
                    <option value="19:00">7:00 PM</option>
                    <option value="20:00">8:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Street Address <span className="req">*</span></label>
                  <input
                    type="text"
                    name="address"
                    value={bookingForm.address}
                    onChange={handleInputChange}
                    placeholder="House no., street name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={bookingForm.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Mumbai"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Problem Description</label>
                <textarea
                  name="problemDesc"
                  value={bookingForm.problemDesc}
                  onChange={handleInputChange}
                  placeholder="Briefly describe the issue (optional)"
                  rows={3}
                />
              </div>

              <div className="form-group checkbox">
                <label>
                  <input type="checkbox" name="emergency" checked={bookingForm.emergency} onChange={handleInputChange} />
                  🚨 Mark as Emergency Service
                </label>
              </div>

              {submitError && <div className="error-msg">⚠ {submitError}</div>}
              {submitSuccess && <div className="success-msg">✅ Booking confirmed! Taking you to your bookings...</div>}

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? <span className="btn-spinner">⏳ Processing...</span> : 'Confirm Booking →'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
