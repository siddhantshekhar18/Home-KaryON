import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Plumbing.css';
import { bookingsAPI } from '../../api';

const Plumber = () => {
  const navigate = useNavigate();

  const openBookingForm = () => {
    if (!localStorage.getItem('token')) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    setShowBookingForm(true);
  };

  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [counterValues, setCounterValues] = useState({
    plumbers: 0,
    jobs: 0,
    clients: 0,
    cities: 0
  });
  
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: '',
    date: '',
    time: '',
    address: '',
    problemDesc: '',
    emergency: false
  });

const [showBookingForm, setShowBookingForm] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const statsRef = useRef(null);
  const parallaxRef = useRef(null);

  // Counter Animation
  useEffect(() => {
    const targets = {
      plumbers: 250,
      jobs: 15000,
      clients: 12000,
      cities: 25
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

  // Plumbing Services Data
  const plumbingServices = [
    { 
      icon: "🚰", 
      title: "Leak Repairs", 
      description: "Expert leak detection and repair for pipes, faucets, and toilets",
      price: "From ₹89",
      features: ["Same-day service", "30-day guarantee", "Licensed plumbers"],
      color: "#667eea"
    },
    { 
      icon: "🚽", 
      title: "Toilet Installation", 
      description: "Professional installation and repair for all toilet types",
      price: "From ₹149",
      features: ["All brands", "Water-efficient", "1-year warranty"],
      color: "#fc7f03"
    },
    { 
      icon: "🚿", 
      title: "Shower & Bath", 
      description: "Complete bathroom plumbing installation and repair",
      price: "From ₹199",
      features: ["Fixture install", "Pressure test", "Leak proof"],
      color: "#502222"
    },
    { 
      icon: "💧", 
      title: "Drain Cleaning", 
      description: "Professional drain clearing and sewer line services",
      price: "From ₹119",
      features: ["Hydro-jetting", "Camera inspect", "Root removal"],
      color: "#667eea"
    },
    { 
      icon: "🔥", 
      title: "Water Heaters", 
      description: "Installation and repair of all water heater types",
      price: "From ₹299",
      features: ["Tank & tankless", "Energy star", "Emergency"],
      color: "#fc7f03"
    },
    { 
      icon: "🔧", 
      title: "Pipe Installation", 
      description: "New pipe installation and complete repiping services",
      price: "From ₹249",
      features: ["Copper & PEX", "Code compliant", "Permits"],
      color: "#502222"
    },
    { 
      icon: "💦", 
      title: "Sump Pumps", 
      description: "Sump pump installation, repair, and maintenance",
      price: "From ₹179",
      features: ["Battery backup", "Flood prevent", "Annual check"],
      color: "#667eea"
    },
    { 
      icon: "⚡", 
      title: "Emergency Service", 
      description: "24/7 emergency plumbing for urgent issues",
      price: "24/7 Available",
      features: ["1-hour response", "No overtime", "Weekends"],
      color: "#fc7f03"
    }
  ];

  // Testimonials Data
  const testimonials = [
    {
      name: "Robert Miller",
      role: "Homeowner",
      content: "The plumber arrived within an hour and fixed my burst pipe quickly. Excellent emergency service!",
      rating: 5,
      image: "👨"
    },
    {
      name: "Patricia Davis",
      role: "Property Manager",
      content: "Used them for multiple properties. Always reliable, professional, and fairly priced plumbing work.",
      rating: 5,
      image: "👩"
    },
    {
      name: "James Wilson",
      role: "New Homeowner",
      content: "Installed a new water heater and fixed all leaky faucets. Great work and clean service.",
      rating: 5,
      image: "👨‍🦰"
    }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const serviceNames = {
        leak: 'Leak Repair',
        toilet: 'Toilet Installation',
        drain: 'Drain Cleaning',
        heater: 'Water Heater',
        pipe: 'Pipe Repair',
        emergency: 'Emergency Service'
      };

      const bookingData = {
        customer: {
          name: bookingForm.name,
          email: bookingForm.email,
          phone: bookingForm.phone
        },
        service: {
          type: 'Plumbing',
          name: serviceNames[bookingForm.serviceType] || bookingForm.serviceType,
          description: bookingForm.problemDesc,
          subService: bookingForm.serviceType
        },
        schedule: {
          date: bookingForm.date,
          time: bookingForm.time,
          isEmergency: bookingForm.emergency
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
            name: '', email: '', phone: '', serviceType: '', 
            date: '', time: '', address: '', problemDesc: '', emergency: false
          });
          setSubmitSuccess(false);
          navigate('/bookings');
        }, 2000);
      }
    } catch (error) {
      console.error('Booking error:', error);
      setSubmitError(error.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setFormStep(prev => prev + 1);
  const prevStep = () => setFormStep(prev => prev - 1);

  return (
    <div className="plumber">
      {/* Hero Section with Parallax */}
      <section className="plumber-hero">
        <div className="plumber-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`plumber-particle particle-${i + 1}`}></div>
          ))}
        </div>
        
        <div className="plumber-hero-background" ref={parallaxRef}>
          <div className="plumber-hero-gradient"></div>
          <div className="plumber-hero-pattern"></div>
        </div>

        <div className="plumber-hero-container">
          <div className="plumber-hero-content">
            <div className="plumber-hero-badge">
              <span className="badge-pulse"></span>
              <span className="badge-text">24/7 Emergency Plumbing • 1-Hour Response</span>
            </div>
            
            <h1 className="plumber-hero-title">
              <span className="title-line">Professional</span>
              <span className="title-highlight">Plumbing Services</span>
            </h1>
            
            <p className="plumber-hero-description">
              From leak repairs to full installations, connect with licensed plumbers 
              for all your plumbing needs. Emergency service available 24/7!
            </p>

            <div className="plumber-hero-cta">
              <button 
                className="cta-btn-primary"
                onClick={openBookingForm}
              >
                <span>Book a Plumber</span>
                <span className="btn-icon">→</span>
                <div className="btn-shine"></div>
              </button>
              
              <a href="tel:+18885550123" className="cta-btn-secondary">
                <span className="btn-play-icon">📞</span>
                <span>Emergency Call</span>
              </a>
            </div>

            <div className="plumber-hero-stats">
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Emergency</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">1hr</span>
                <span className="stat-label">Response</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Guarantee</span>
              </div>
            </div>
          </div>

          <div className="plumber-hero-visual">
            <div className="plumber-floating-card card-1">
              <span className="card-icon">🚰</span>
              <div className="card-text">
                <strong>Leak Repair</strong>
                <span>30 min fix</span>
              </div>
            </div>
            <div className="plumber-floating-card card-2">
              <span className="card-icon">⭐</span>
              <div className="card-text">
                <strong>4.9 Rating</strong>
                <span>1.5k+ reviews</span>
              </div>
            </div>
            <div className="plumber-floating-card card-3">
              <span className="card-icon">⚡</span>
              <div className="card-text">
                <strong>Emergency</strong>
                <span>1hr response</span>
              </div>
            </div>
            
            <div className="plumber-hero-image-wrapper">
              <div className="plumber-hero-image-glow"></div>
              <div className="plumber-hero-image">
                <div className="plumber-hero-image-content">
                  <span className="main-emoji">🔧</span>
                  <span className="service-emoji-1">🚰</span>
                  <span className="service-emoji-2">🚽</span>
                  <span className="service-emoji-3">💧</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="plumber-hero-wave">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,42.7C960,43,1056,53,1152,58.7C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Emergency Banner */}
      

      {/* Services Section */}
      <section className="plumber-services">
        <div className="plumber-services-container">
          <div className="section-header">
            <span className="section-subtitle">What We Offer</span>
            <h2 className="section-title">
              Our <span className="title-accent">Plumbing</span> Services
            </h2>
            <p className="section-description">
              Professional plumbing solutions for every need, backed by expertise and guarantees
            </p>
          </div>

          <div className="plumber-services-grid">
            {plumbingServices.map((service, index) => (
              <div key={index} className="plumber-service-card" style={{ '--card-color': service.color }}>
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
                  onClick={openBookingForm}
                >
                  Book Now →
                </button>
                <div className="service-hover-indicator"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="plumber-stats" ref={statsRef}>
        <div className="plumber-stats-background">
          <div className="plumber-stats-pattern"></div>
        </div>

        <div className="plumber-stats-container">
          <div className="plumber-stats-grid">
            <div className="stats-card">
              <div className="stats-icon">👨‍🔧</div>
              <div className="stats-content">
                <span className="stats-number">{counterValues.plumbers}+</span>
                <span className="stats-label">Expert Plumbers</span>
              </div>
              <div className="stats-progress"></div>
            </div>

            <div className="stats-card">
              <div className="stats-icon">🔧</div>
              <div className="stats-content">
                <span className="stats-number">{counterValues.jobs.toLocaleString()}+</span>
                <span className="stats-label">Jobs Completed</span>
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

      {/* Common Problems Section */}
      

      {/* How It Works */}
      <section className="plumber-how-it-works">
        <div className="plumber-works-container">
          <div className="section-header light">
            <span className="section-subtitle">Simple Process</span>
            <h2 className="section-title">
              How It <span className="title-accent">Works</span>
            </h2>
          </div>

          <div className="plumber-steps">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon">📞</div>
              <h3>Call or Book</h3>
              <p>Contact us online or by phone</p>
              <div className="step-glow"></div>
            </div>

            <div className="step-connector">
              <span className="connector-dot"></span>
              <span className="connector-line"></span>
              <span className="connector-dot"></span>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon">🚰</div>
              <h3>We Arrive</h3>
              <p>Licensed plumber at your door</p>
              <div className="step-glow"></div>
            </div>

            <div className="step-connector">
              <span className="connector-dot"></span>
              <span className="connector-line"></span>
              <span className="connector-dot"></span>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon">✅</div>
              <h3>Problem Fixed</h3>
              <p>Quality work with guarantee</p>
              <div className="step-glow"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="plumber-testimonials">
        <div className="plumber-testimonials-container">
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

      {/* Booking Modal */}
      {showBookingForm && (
        <div className="booking-modal-overlay" onClick={() => setShowBookingForm(false)}>
          <div className="booking-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowBookingForm(false)}>×</button>
            
            <div className="modal-header">
              <h2>Book a Plumber</h2>
              <p>Fill in your details and we'll connect you with a professional</p>
            </div>

            <div className="booking-progress">
              <div className={`progress-step ${formStep >= 1 ? 'active' : ''}`}>
                <span className="step-num">1</span>
                <span className="step-label">Details</span>
              </div>
              <div className={`progress-step ${formStep >= 2 ? 'active' : ''}`}>
                <span className="step-num">2</span>
                <span className="step-label">Schedule</span>
              </div>
              <div className={`progress-step ${formStep >= 3 ? 'active' : ''}`}>
                <span className="step-num">3</span>
                <span className="step-label">Confirm</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="booking-form">
              {formStep === 1 && (
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
                      <label>Service Type *</label>
                      <select
                        name="serviceType"
                        value={bookingForm.serviceType}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select service</option>
                        <option value="leak">Leak Repair</option>
                        <option value="toilet">Toilet Installation</option>
                        <option value="drain">Drain Cleaning</option>
                        <option value="heater">Water Heater</option>
                        <option value="pipe">Pipe Repair</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </div>
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

                  <div className="form-actions">
                    <button type="button" className="btn-next" onClick={nextStep}>
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {formStep === 2 && (
                <div className="form-step">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date *</label>
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
                      <label>Time *</label>
                      <select
                        name="time"
                        value={bookingForm.time}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select time</option>
                        <option value="8-10">8:00 AM - 10:00 AM</option>
                        <option value="10-12">10:00 AM - 12:00 PM</option>
                        <option value="12-2">12:00 PM - 2:00 PM</option>
                        <option value="2-4">2:00 PM - 4:00 PM</option>
                        <option value="4-6">4:00 PM - 6:00 PM</option>
                        <option value="6-8">6:00 PM - 8:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Emergency?</label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="emergency"
                        checked={bookingForm.emergency}
                        onChange={handleInputChange}
                      />
                      <span>This is an emergency (24/7 service)</span>
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Describe the Problem *</label>
                    <textarea
                      name="problemDesc"
                      value={bookingForm.problemDesc}
                      onChange={handleInputChange}
                      required
                      rows="4"
                      placeholder="Please describe the plumbing issue in detail..."
                    ></textarea>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn-prev" onClick={prevStep}>
                      ← Back
                    </button>
                    <button type="button" className="btn-next" onClick={nextStep}>
                      Review →
                    </button>
                  </div>
                </div>
              )}

{formStep === 3 && (
                <div className="form-step">
                  <div className="booking-summary">
                    <h3>Review Your Booking</h3>
                    
                    <div className="summary-item">
                      <span>Name:</span>
                      <strong>{bookingForm.name}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Email:</span>
                      <strong>{bookingForm.email}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Phone:</span>
                      <strong>{bookingForm.phone}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Service:</span>
                      <strong>{bookingForm.serviceType}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Date/Time:</span>
                      <strong>{bookingForm.date} at {bookingForm.time}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Emergency:</span>
                      <strong>{bookingForm.emergency ? 'Yes' : 'No'}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Address:</span>
                      <strong>{bookingForm.address}</strong>
                    </div>
                  </div>

                  {submitError && (
                    <div className="form-error" style={{ color: '#d32f2f', marginBottom: '15px', padding: '10px', backgroundColor: '#ffebee', borderRadius: '5px', fontSize: '14px' }}>
                      {submitError}
                    </div>
                  )}

                  {submitSuccess && (
                    <div className="form-success" style={{ color: '#388e3c', marginBottom: '15px', padding: '10px', backgroundColor: '#e8f5e9', borderRadius: '5px', fontSize: '14px' }}>
                      ✓ Booking confirmed! Redirecting to your bookings...
                    </div>
                  )}

                  <div className="form-actions">
                    <button type="button" className="btn-prev" onClick={prevStep} disabled={isSubmitting}>
                      ← Edit
                    </button>
                    <button type="submit" className="btn-submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Processing...' : 'Confirm Booking →'}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <div className="modal-footer">
              <span className="secure-badge">🔒 100% Secure</span>
              <span className="guarantee-badge">✓ Satisfaction Guaranteed</span>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      
    </div>
  );
};

export default Plumber;