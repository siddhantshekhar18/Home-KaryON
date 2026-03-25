// electrician.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Electrician.css';
import { bookingsAPI } from '../../api';

const Electrician = () => {
  const navigate = useNavigate();

  const requireAuth = () => {
    if (!localStorage.getItem('token')) {
      navigate('/login', { state: { from: window.location.pathname } });
      return false;
    }
    return true;
  };

  const [activeService] = useState('all');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const [, setCounterValues] = useState({
    electricians: 0,
    projects: 0,
    clients: 0,
    cities: 0,
    emergencies: 0
  });
  
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: '',
    issueType: '',
    urgency: 'standard',
    preferredDate: '',
    preferredTime: '',
    address: '',
    propertyType: '',
    issueDescription: '',
    accessInstructions: ''
  });

  const statsRef = useRef(null);
  const parallaxRef = useRef(null);

  // Counter Animation
  useEffect(() => {
    const targets = {
      electricians: 400,
      projects: 12000,
      clients: 10000,
      cities: 35,
      emergencies: 5000
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

  // Electrical Services Data
  const electricalServices = [
    { icon: "💡", title: "Lighting Installation", description: "Professional installation of all types of lighting fixtures", price: "From $89", features: ["LED installation", "Chandeliers", "Smart lighting", "Outdoor lighting"], color: "#667eea", emergency: false },
    { icon: "🔌", title: "Outlet & Switch Repair", description: "Fix or replace faulty outlets, switches, and sockets", price: "From $79", features: ["Outlet replacement", "Switch repair", "GFCI installation", "USB outlets"], color: "#fc7f03", emergency: true },
    { icon: "⚡", title: "Emergency Electrical", description: "24/7 emergency service for urgent electrical issues", price: "From $149", features: ["Power outages", "Sparkling outlets", "Circuit breaker trips", "Emergency response"], color: "#502222", emergency: true, emergencyOnly: true },
    { icon: "🔋", title: "Panel Upgrades", description: "Electrical panel upgrades and replacements", price: "From $1200", features: ["Circuit breaker panels", "Fuse box upgrade", "Safety inspections", "Permit handling"], color: "#667eea", emergency: false },
    { icon: "🏠", title: "Whole House Rewiring", description: "Complete electrical rewiring for safety and capacity", price: "Custom Quote", features: ["Old wiring removal", "Copper wiring", "Code compliance", "Inspection"], color: "#fc7f03", emergency: false },
    { icon: "🎮", title: "Smart Home Setup", description: "Install smart switches, thermostats, and home automation", price: "From $199", features: ["Smart switches", "Thermostats", "Home automation", "Voice control"], color: "#502222", emergency: false },
    { icon: "🔦", title: "Ceiling Fan Installation", description: "Professional ceiling fan installation and repair", price: "From $129", features: ["Fan assembly", "Balancing", "Remote setup", "Light kits"], color: "#667eea", emergency: false },
    { icon: "🛡️", title: "Safety Inspections", description: "Comprehensive electrical safety inspections", price: "From $199", features: ["Code compliance", "Safety audit", "Thermal imaging", "Report"], color: "#fc7f03", emergency: false },
    { icon: "🏢", title: "Commercial Electrical", description: "Electrical services for businesses and commercial spaces", price: "Custom Quote", features: ["3-phase power", "Lighting control", "Data cabling", "Emergency lighting"], color: "#502222", emergency: true },
    { icon: "🔋", title: "EV Charger Installation", description: "Install electric vehicle charging stations", price: "From $899", features: ["Level 2 chargers", "Permit handling", "Panel assessment", "Future-proofing"], color: "#667eea", emergency: false },
    { icon: "⚡", title: "Generator Installation", description: "Standby and portable generator installation", price: "From $2500", features: ["Transfer switches", "Natural gas/propane", "Automatic startup", "Maintenance"], color: "#fc7f03", emergency: true },
    { icon: "🔧", title: "Troubleshooting & Repair", description: "Diagnose and fix electrical problems", price: "From $99", features: ["Diagnostic fee", "Component repair", "Wiring fixes", "Testing"], color: "#502222", emergency: true }
  ];

  const issueTypes = [
    { value: "outage", label: "Power Outage", icon: "⚡", emergency: true },
    { value: "spark", label: "Sparking Outlet", icon: "⚡", emergency: true },
    { value: "breaker", label: "Breaker Tripping", icon: "🔋", emergency: true },
    { value: "light", label: "Light Not Working", icon: "💡", emergency: false },
    { value: "outlet", label: "Dead Outlet", icon: "🔌", emergency: false },
    { value: "fan", label: "Fan Not Working", icon: "🔦", emergency: false },
    { value: "installation", label: "New Installation", icon: "🏠", emergency: false },
    { value: "inspection", label: "Safety Inspection", icon: "🛡️", emergency: false },
    { value: "upgrade", label: "Panel Upgrade", icon: "🔋", emergency: false },
    { value: "smart", label: "Smart Home Setup", icon: "🎮", emergency: false },
    { value: "ev", label: "EV Charger", icon: "🔋", emergency: false },
    { value: "other", label: "Other Issue", icon: "🔧", emergency: false }
  ];

  const urgencyLevels = [
    { value: "standard", label: "Standard (24-48 hours)", color: "#4caf50" },
    { value: "urgent", label: "Urgent (Today)", color: "#fc7f03" },
    { value: "emergency", label: "Emergency (Within 2 hours)", color: "#f44336" }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (name === 'urgency') {
      setEmergencyMode(value === 'emergency');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const issueLabel = issueTypes.find(i => i.value === bookingForm.issueType)?.label || bookingForm.issueType;
      const bookingData = {
        customer: { name: bookingForm.name, email: bookingForm.email, phone: bookingForm.phone },
        service: { type: 'Electrical', name: bookingForm.serviceType || 'Electrical Service', description: `${issueLabel} - ${bookingForm.issueDescription || ''}`, subService: bookingForm.issueType },
        schedule: { date: bookingForm.preferredDate || new Date().toISOString().split('T')[0], time: bookingForm.preferredTime || 'standard', isEmergency: bookingForm.urgency === 'emergency' || bookingForm.urgency === 'urgent' },
        address: { street: bookingForm.address, city: '', zipCode: '' },
        pricing: { basePrice: 0, currency: 'INR' }
      };
      const response = await bookingsAPI.create(bookingData);
      if (response.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setShowBookingForm(false); setFormStep(1); setEmergencyMode(false);
          setBookingForm({ name: '', email: '', phone: '', serviceType: '', issueType: '', urgency: 'standard', preferredDate: '', preferredTime: '', address: '', propertyType: '', issueDescription: '', accessInstructions: '' });
          setSubmitSuccess(false);
          navigate('/bookings');
        }, 2000);
      }
    } catch (error) {
      setSubmitError(error.message || 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setFormStep(prev => prev + 1);
  const prevStep = () => setFormStep(prev => prev - 1);

  const filteredServices = activeService === 'all' ? electricalServices : electricalServices.filter(s => activeService === 'emergency' ? s.emergency : s.title.toLowerCase().includes(activeService));

  return (
    <div className="electrician">
      {/* Simplified version - full code would include all sections */}
      <section className="electrician-hero">
        <div className="electrician-hero-background" ref={parallaxRef}></div>
        <div className="electrician-hero-container">
          <div className="electrician-hero-content">
            <h1 className="electrician-hero-title"><span className="title-line">Professional</span><span className="title-highlight">Electrical Services</span></h1>
            <p className="electrician-hero-description">From emergency repairs to complete rewiring, our licensed electricians ensure your home or business is safe, efficient, and up to code.</p>
            <div className="electrician-hero-cta">
              <button className="cta-btn-primary" onClick={() => { if (!requireAuth()) return; setEmergencyMode(false); setShowBookingForm(true); }}><span>Schedule Service</span><span className="btn-icon">→</span></button>
              <button className="cta-btn-secondary emergency" onClick={() => { if (!requireAuth()) return; setEmergencyMode(true); setBookingForm(prev => ({ ...prev, urgency: 'emergency' })); setShowBookingForm(true); }}><span className="btn-play-icon">⚡</span><span>24/7 Emergency</span></button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="electrician-services">
        <div className="electrician-services-container">
          <div className="section-header">
            <span className="section-subtitle">What We Offer</span>
            <h2 className="section-title">Our <span className="title-accent">Electrical</span> Services</h2>
          </div>
          <div className="electrician-services-grid">
            {filteredServices.map((service, index) => (
              <div key={index} className="electrician-service-card" style={{ '--service-color': service.color }}>
                <div className="service-icon-wrapper"><span className="service-icon">{service.icon}</span></div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
                <div className="service-price">{service.price}</div>
                <button className={`service-book ${service.emergency ? 'emergency-btn' : ''}`} onClick={() => { if (!requireAuth()) return; setEmergencyMode(service.emergency); setBookingForm(prev => ({ ...prev, serviceType: service.title, urgency: service.emergency ? 'emergency' : 'standard' })); setShowBookingForm(true); }}>{service.emergency ? 'Emergency Call →' : 'Schedule Service →'}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {showBookingForm && (
        <div className="booking-modal-overlay" onClick={() => setShowBookingForm(false)}>
          <div className={`booking-modal ${emergencyMode ? 'emergency-mode' : ''}`} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowBookingForm(false)}>×</button>
            {emergencyMode && <div className="emergency-header"><h2>⚠️ Emergency Electrical Service</h2></div>}
            {!emergencyMode && <div className="modal-header"><h2>Schedule Electrical Service</h2></div>}
            <form onSubmit={handleSubmit} className="booking-form">
              {formStep === 1 && (
                <div className="form-step">
                  <div className="form-group">
                    <label>Issue Type *</label>
                    <select name="issueType" value={bookingForm.issueType} onChange={handleInputChange} required>
                      <option value="">Select issue type</option>
                      {issueTypes.map(type => (<option key={type.value} value={type.value}>{type.icon} {type.label}</option>))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Urgency Level *</label>
                    {urgencyLevels.map(level => (
                      <label key={level.value} className="urgency-option">
                        <input type="radio" name="urgency" value={level.value} checked={bookingForm.urgency === level.value} onChange={handleInputChange} required />
                        <span className="urgency-label" style={{ backgroundColor: level.color + '20', borderColor: level.color }}><span className="urgency-dot" style={{ backgroundColor: level.color }}></span>{level.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="form-group">
                    <label>Describe the Issue *</label>
                    <textarea name="issueDescription" value={bookingForm.issueDescription} onChange={handleInputChange} rows="4" placeholder="Please describe the electrical problem in detail..." required></textarea>
                  </div>
                  <div className="form-actions">
                    <button type="button" className="btn-next" onClick={nextStep}>Next →</button>
                  </div>
                </div>
              )}
              {formStep === 2 && (
                <div className="form-step">
                  {!emergencyMode && (
                    <>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Preferred Date *</label>
                          <input type="date" name="preferredDate" value={bookingForm.preferredDate} onChange={handleInputChange} required={!emergencyMode} min={new Date().toISOString().split('T')[0]} />
                        </div>
                        <div className="form-group">
                          <label>Preferred Time *</label>
                          <select name="preferredTime" value={bookingForm.preferredTime} onChange={handleInputChange} required={!emergencyMode}>
                            <option value="">Select time</option>
                            <option value="morning">Morning (8AM - 12PM)</option>
                            <option value="afternoon">Afternoon (12PM - 4PM)</option>
                            <option value="evening">Evening (4PM - 8PM)</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                  {emergencyMode && <div className="emergency-notice"><h3>Emergency Service - Our electrician will contact you within 30 minutes</h3></div>}
                  <div className="form-actions">
                    <button type="button" className="btn-prev" onClick={prevStep}>← Back</button>
                    <button type="button" className="btn-next" onClick={nextStep}>Next →</button>
                  </div>
                </div>
              )}
              {formStep === 3 && (
                <div className="form-step">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input type="text" name="name" value={bookingForm.name} onChange={handleInputChange} required placeholder="John Doe" />
                    </div>
                    <div className="form-group">
                      <label>Email *</label>
                      <input type="email" name="email" value={bookingForm.email} onChange={handleInputChange} required placeholder="john@example.com" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone *</label>
                      <input type="tel" name="phone" value={bookingForm.phone} onChange={handleInputChange} required placeholder="(555) 123-4567" />
                    </div>
                    <div className="form-group">
                      <label>Service Address *</label>
                      <input type="text" name="address" value={bookingForm.address} onChange={handleInputChange} required placeholder="Street address, city, zip" />
                    </div>
                  </div>
                  {submitError && <div className="form-error" style={{ color: '#d32f2f', marginBottom: '15px' }}>{submitError}</div>}
                  {submitSuccess && <div className="form-success" style={{ color: '#388e3c', marginBottom: '15px' }}>✓ Booking confirmed! Redirecting...</div>}
                  <div className="form-actions">
                    <button type="button" className="btn-prev" onClick={prevStep} disabled={isSubmitting}>← Edit</button>
                    <button type="submit" className={`btn-submit ${emergencyMode ? 'emergency-submit' : ''}`} disabled={isSubmitting}>{isSubmitting ? 'Processing...' : emergencyMode ? 'Request Emergency Service →' : 'Schedule Service →'}</button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Electrician;
