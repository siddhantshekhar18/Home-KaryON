import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../../api';
import './HomeCleaning.css';

const HomeCleaning = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('description');
  const [selectedPackage, setSelectedPackage] = useState('standard');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [address, setAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [faqOpen, setFaqOpen] = useState(null);

  // Service packages
  const packages = [
    {
      id: 'basic',
      name: 'Basic Clean',
      price: 1499,
      duration: '2 hours',
      features: [
        'Dusting of all surfaces',
        'Floor mopping',
        'Kitchen counter cleaning',
        'Bathroom cleaning',
        'Trash removal'
      ],
      icon: '🧹',
      color: '#667eea'
    },
    {
      id: 'standard',
      name: 'Standard Clean',
      price: 2499,
      duration: '3 hours',
      features: [
        'Everything in Basic',
        'Deep cleaning of kitchen',
        'Deep cleaning of bathrooms',
        'Window sills cleaning',
        'Cabinet exterior cleaning',
        'Appliance exterior cleaning'
      ],
      icon: '✨',
      color: '#502222',
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium Clean',
      price: 3999,
      duration: '5 hours',
      features: [
        'Everything in Standard',
        'Inside cabinet cleaning',
        'Inside fridge cleaning',
        'Inside oven cleaning',
        'Inside microwave cleaning',
        'Balcony cleaning',
        'Window glass cleaning'
      ],
      icon: '🌟',
      color: '#fc7f03'
    }
  ];

  // Available extras
  const extras = [
    { id: 'fridge', name: 'Fridge Cleaning', price: 499, icon: '🧊' },
    { id: 'oven', name: 'Oven Cleaning', price: 399, icon: '🔥' },
    { id: 'windows', name: 'Window Cleaning', price: 299, icon: '🪟' },
    { id: 'balcony', name: 'Balcony Cleaning', price: 349, icon: '🏠' },
    { id: 'carpet', name: 'Carpet Cleaning', price: 599, icon: '🧵' },
    { id: 'sofa', name: 'Sofa Cleaning', price: 799, icon: '🛋️' }
  ];

  // Professionals data
  const professionals = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      image: 'https://randomuser.me/api/portraits/men/1.jpg',
      rating: 4.9,
      reviews: 128,
      jobs: 345,
      experience: '5 years',
      verified: true,
      badge: 'Expert Cleaner'
    },
    {
      id: 2,
      name: 'Priya Sharma',
      image: 'https://randomuser.me/api/portraits/women/2.jpg',
      rating: 4.8,
      reviews: 96,
      jobs: 267,
      experience: '4 years',
      verified: true,
      badge: 'Deep Clean Specialist'
    },
    {
      id: 3,
      name: 'Amit Patel',
      image: 'https://randomuser.me/api/portraits/men/3.jpg',
      rating: 5.0,
      reviews: 215,
      jobs: 489,
      experience: '7 years',
      verified: true,
      badge: 'Premium Cleaner'
    }
  ];

  // Reviews data
  const reviews = [
    {
      id: 1,
      name: 'Sneha Reddy',
      image: 'https://randomuser.me/api/portraits/women/4.jpg',
      rating: 5,
      date: '2 days ago',
      comment: 'Excellent service! The team was very professional and thorough. My house looks spotless!',
      package: 'Premium Clean'
    },
    {
      id: 2,
      name: 'Vikram Mehta',
      image: 'https://randomuser.me/api/portraits/men/5.jpg',
      rating: 5,
      date: '1 week ago',
      comment: 'Very satisfied with the cleaning. They paid attention to every detail. Will definitely book again.',
      package: 'Standard Clean'
    },
    {
      id: 3,
      name: 'Anjali Gupta',
      image: 'https://randomuser.me/api/portraits/women/6.jpg',
      rating: 4,
      date: '2 weeks ago',
      comment: 'Good service overall. The team arrived on time and did a great job with the kitchen.',
      package: 'Basic Clean'
    }
  ];

  // Gallery images
  const galleryImages = [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600',
    'https://images.unsplash.com/photo-1527515637462-cff94ee56a42?w=600',
    'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600',
    'https://images.unsplash.com/photo-1556911220-bda9f7f7597e?w=600'
  ];

  // FAQs
  const faqs = [
    {
      question: 'What cleaning products do you use?',
      answer: 'We use eco-friendly, non-toxic cleaning products that are safe for your family and pets. If you have specific product preferences, let us know in the special instructions.'
    },
    {
      question: 'Do I need to be home during cleaning?',
      answer: 'Not necessarily. You can provide access instructions, and we\'ll ensure everything is secured after cleaning. Many customers prefer to be home for the first cleaning.'
    },
    {
      question: 'What if I\'m not satisfied with the cleaning?',
      answer: 'We offer a 100% satisfaction guarantee. If you\'re not happy with any area, we\'ll re-clean it within 24 hours at no extra cost.'
    },
    {
      question: 'How do I prepare for the cleaning?',
      answer: 'Just pick up clutter and personal items from surfaces. Our team will handle the rest. For deep cleaning, ensure access to all areas you want cleaned.'
    }
  ];

  useEffect(() => {
    // Auto-rotate gallery
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [galleryImages.length]);

  const calculateTotal = () => {
    const packagePrice = packages.find(p => p.id === selectedPackage)?.price || 0;
    const extrasTotal = selectedExtras.reduce((sum, extraId) => {
      const extra = extras.find(e => e.id === extraId);
      return sum + (extra?.price || 0);
    }, 0);
    return packagePrice + extrasTotal;
  };

  const handleExtraToggle = (extraId) => {
    setSelectedExtras(prev =>
      prev.includes(extraId)
        ? prev.filter(id => id !== extraId)
        : [...prev, extraId]
    );
  };

  const handleBooking = () => {
    if (!bookingDate || !bookingTime || !address) {
      alert('Please fill in all required fields');
      return;
    }

    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      alert('Please login to place booking.');
      navigate('/login');
      return;
    }

    setShowBookingModal(true);
  };

  const confirmBooking = async () => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');

      if (!userData?.name || !userData?.email || !userData?.phone) {
        setSubmitError('Please complete your profile (name, email, phone) before booking.');
        setIsSubmitting(false);
        return;
      }

      const selectedPackageDetails = packages.find(pkg => pkg.id === selectedPackage);
      const extrasText = selectedExtras
        .map(extraId => extras.find(extra => extra.id === extraId)?.name)
        .filter(Boolean)
        .join(', ');

      const bookingData = {
        customer: {
          name: userData.name,
          email: userData.email,
          phone: userData.phone
        },
        service: {
          type: 'Cleaning',
          name: selectedPackageDetails ? `Home Cleaning - ${selectedPackageDetails.name}` : 'Home Cleaning',
          description: `${specialInstructions || 'Home cleaning request'}${extrasText ? ` | Extras: ${extrasText}` : ''}`,
          subService: selectedPackage
        },
        schedule: {
          date: bookingDate,
          time: bookingTime,
          isEmergency: false
        },
        address: {
          street: address,
          city: '',
          zipCode: ''
        },
        pricing: {
          basePrice: calculateTotal(),
          totalPrice: calculateTotal(),
          currency: 'INR'
        }
      };

      const response = await bookingsAPI.create(bookingData);

      if (response.success) {
        setShowBookingModal(false);
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          navigate('/bookings');
        }, 1800);
      }
    } catch (error) {
      setSubmitError(error.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
  ];

  return (
    <div className="service-page home-cleaning">
      {/* Hero Section */}
      <section className="service-hero">
        <div className="hero-particles">
          {[...Array(15)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}></div>
          ))}
        </div>
        
        <div className="hero-container">
          <div className="hero-content">
            <div className="service-badge animate-on-scroll">
              <span className="badge-icon">🧹</span>
              <span>Professional Cleaning Service</span>
            </div>
            
            <h1 className="hero-title animate-on-scroll">
              Home <span className="title-highlight">Cleaning</span> Services
            </h1>
            
            <p className="hero-description animate-on-scroll">
              Experience spotless cleaning with our verified professionals. 
              We use eco-friendly products and follow strict safety protocols.
            </p>

            <div className="hero-stats animate-on-scroll">
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Happy Clients</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">4.9</span>
                <span className="stat-label">Rating</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Support</span>
              </div>
            </div>

            <div className="hero-actions animate-on-scroll">
              <button className="btn-primary" onClick={() => document.getElementById('booking-section').scrollIntoView({ behavior: 'smooth' })}>
                Book Now
                <span className="btn-icon">→</span>
              </button>
              <button className="btn-secondary" onClick={() => setActiveTab('reviews')}>
                Read Reviews
              </button>
            </div>
          </div>

          <div className="hero-image-wrapper animate-on-scroll">
            <div className="hero-image-container">
              <img 
                src={galleryImages[currentImageIndex]} 
                alt="Cleaning Service"
                className="hero-image"
              />
              <div className="image-overlay"></div>
              <div className="image-badges">
                <div className="badge verified">
                  <span className="badge-icon">✓</span>
                  Verified Pros
                </div>
                <div className="badge guarantee">
                  <span className="badge-icon">🛡️</span>
                  100% Guarantee
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-wave">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#f8fafc" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,170.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Quick Info Bar */}
      <div className="info-bar">
        <div className="info-item">
          <span className="info-icon">⏱️</span>
          <div className="info-text">
            <strong>Same Day Service</strong>
            <span>Available in your area</span>
          </div>
        </div>
        <div className="info-divider"></div>
        <div className="info-item">
          <span className="info-icon">🧼</span>
          <div className="info-text">
            <strong>Eco-Friendly Products</strong>
            <span>Safe for family & pets</span>
          </div>
        </div>
        <div className="info-divider"></div>
        <div className="info-item">
          <span className="info-icon">🛡️</span>
          <div className="info-text">
            <strong>Insured & Bonded</strong>
            <span>Full protection coverage</span>
          </div>
        </div>
        <div className="info-divider"></div>
        <div className="info-item">
          <span className="info-icon">💯</span>
          <div className="info-text">
            <strong>Satisfaction Guarantee</strong>
            <span>Or money back</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="service-content">
        <div className="content-container">
          {/* Left Column - Main Info */}
          <div className="content-left">
            {/* Tabs */}
            <div className="content-tabs">
              <button 
                className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button 
                className={`tab-btn ${activeTab === 'packages' ? 'active' : ''}`}
                onClick={() => setActiveTab('packages')}
              >
                Packages
              </button>
              <button 
                className={`tab-btn ${activeTab === 'process' ? 'active' : ''}`}
                onClick={() => setActiveTab('process')}
              >
                Process
              </button>
              <button 
                className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews
              </button>
              <button 
                className={`tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
                onClick={() => setActiveTab('faq')}
              >
                FAQ
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {/* Description Tab */}
              {activeTab === 'description' && (
                <div className="description-tab animate-fade-in">
                  <h2>About Our Home Cleaning Service</h2>
                  <p>
                    Our professional home cleaning service is designed to give you a spotless, 
                    healthy living environment without the hassle. We understand that every home 
                    is unique, which is why we offer customized cleaning plans tailored to your 
                    specific needs.
                  </p>

                  <h3>What We Clean</h3>
                  <div className="cleaning-grid">
                    <div className="cleaning-item">
                      <span className="item-icon">🛏️</span>
                      <span>Bedrooms</span>
                    </div>
                    <div className="cleaning-item">
                      <span className="item-icon">🚽</span>
                      <span>Bathrooms</span>
                    </div>
                    <div className="cleaning-item">
                      <span className="item-icon">🍳</span>
                      <span>Kitchen</span>
                    </div>
                    <div className="cleaning-item">
                      <span className="item-icon">🪑</span>
                      <span>Living Room</span>
                    </div>
                    <div className="cleaning-item">
                      <span className="item-icon">🪟</span>
                      <span>Windows</span>
                    </div>
                    <div className="cleaning-item">
                      <span className="item-icon">🧺</span>
                      <span>Floors</span>
                    </div>
                  </div>

                  <h3>Why Choose Us</h3>
                  <ul className="benefits-list">
                    <li>
                      <span className="benefit-icon">✓</span>
                      <div>
                        <strong>Verified Professionals</strong>
                        <p>All cleaners are background-checked and trained</p>
                      </div>
                    </li>
                    <li>
                      <span className="benefit-icon">✓</span>
                      <div>
                        <strong>Eco-Friendly Products</strong>
                        <p>Safe for children, pets, and the environment</p>
                      </div>
                    </li>
                    <li>
                      <span className="benefit-icon">✓</span>
                      <div>
                        <strong>Flexible Scheduling</strong>
                        <p>Book online 24/7 with instant confirmation</p>
                      </div>
                    </li>
                    <li>
                      <span className="benefit-icon">✓</span>
                      <div>
                        <strong>Satisfaction Guarantee</strong>
                        <p>Not happy? We'll re-clean for free</p>
                      </div>
                    </li>
                  </ul>
                </div>
              )}

              {/* Packages Tab */}
              {activeTab === 'packages' && (
                <div className="packages-tab animate-fade-in">
                  <h2>Cleaning Packages</h2>
                  <p>Choose the perfect package for your needs</p>

                  <div className="packages-grid">
                    {packages.map((pkg) => (
                      <div 
                        key={pkg.id}
                        className={`package-card ${selectedPackage === pkg.id ? 'selected' : ''}`}
                        onClick={() => setSelectedPackage(pkg.id)}
                      >
                        {pkg.popular && <div className="popular-badge">Most Popular</div>}
                        <div className="package-header" style={{ background: `linear-gradient(135deg, ${pkg.color}20, ${pkg.color}05)` }}>
                          <span className="package-icon">{pkg.icon}</span>
                          <h3>{pkg.name}</h3>
                          <div className="package-price">
                            <span className="price">₹{pkg.price}</span>
                            <span className="duration">{pkg.duration}</span>
                          </div>
                        </div>
                        <div className="package-features">
                          {pkg.features.map((feature, index) => (
                            <div key={index} className="feature">
                              <span className="feature-check">✓</span>
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Process Tab */}
              {activeTab === 'process' && (
                <div className="process-tab animate-fade-in">
                  <h2>Our Cleaning Process</h2>
                  <p>We follow a systematic approach to ensure thorough cleaning</p>

                  <div className="process-steps">
                    <div className="process-step">
                      <div className="step-number">1</div>
                      <div className="step-content">
                        <h3>Inspection</h3>
                        <p>We assess your home and identify areas needing special attention</p>
                      </div>
                    </div>
                    <div className="process-step">
                      <div className="step-number">2</div>
                      <div className="step-content">
                        <h3>Preparation</h3>
                        <p>We set up equipment and apply appropriate cleaning solutions</p>
                      </div>
                    </div>
                    <div className="process-step">
                      <div className="step-number">3</div>
                      <div className="step-content">
                        <h3>Deep Cleaning</h3>
                        <p>Thorough cleaning of all surfaces, corners, and hidden areas</p>
                      </div>
                    </div>
                    <div className="process-step">
                      <div className="step-number">4</div>
                      <div className="step-content">
                        <h3>Sanitization</h3>
                        <p>Disinfection of high-touch areas and sanitization</p>
                      </div>
                    </div>
                    <div className="process-step">
                      <div className="step-number">5</div>
                      <div className="step-content">
                        <h3>Quality Check</h3>
                        <p>Final inspection to ensure everything meets our standards</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="reviews-tab animate-fade-in">
                  <div className="reviews-header">
                    <h2>Customer Reviews</h2>
                    <div className="overall-rating">
                      <span className="rating-number">4.9</span>
                      <div className="rating-stars">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="star filled">★</span>
                        ))}
                      </div>
                      <span className="total-reviews">Based on 500+ reviews</span>
                    </div>
                  </div>

                  <div className="reviews-list">
                    {reviews.map((review) => (
                      <div key={review.id} className="review-card">
                        <div className="reviewer">
                          <img src={review.image} alt={review.name} />
                          <div>
                            <h4>{review.name}</h4>
                            <span className="review-date">{review.date}</span>
                          </div>
                        </div>
                        <div className="review-rating">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`star ${i < review.rating ? 'filled' : ''}`}>★</span>
                          ))}
                          <span className="review-package">{review.package}</span>
                        </div>
                        <p className="review-comment">"{review.comment}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQ Tab */}
              {activeTab === 'faq' && (
                <div className="faq-tab animate-fade-in">
                  <h2>Frequently Asked Questions</h2>
                  
                  <div className="faq-list">
                    {faqs.map((faq, index) => (
                      <div key={index} className="faq-item">
                        <button 
                          className={`faq-question ${faqOpen === index ? 'active' : ''}`}
                          onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                        >
                          {faq.question}
                          <span className="faq-icon">{faqOpen === index ? '−' : '+'}</span>
                        </button>
                        {faqOpen === index && (
                          <div className="faq-answer">
                            <p>{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Section */}
          <div className="content-right" id="booking-section">
            <div className="booking-card">
              <h3>Book Your Cleaning</h3>
              
              <div className="selected-package">
                <span className="package-label">Selected Package:</span>
                <span className="package-name">
                  {packages.find(p => p.id === selectedPackage)?.name}
                </span>
              </div>

              <div className="form-group">
                <label>Select Date</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label>Select Time</label>
                <select 
                  className="form-input"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                >
                  <option value="">Choose a time slot</option>
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Service Address</label>
                <textarea 
                  className="form-input"
                  rows="3"
                  placeholder="Enter your complete address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                ></textarea>
              </div>

              <div className="form-group">
                <label>Add Extras</label>
                <div className="extras-grid">
                  {extras.map(extra => (
                    <button
                      key={extra.id}
                      className={`extra-btn ${selectedExtras.includes(extra.id) ? 'selected' : ''}`}
                      onClick={() => handleExtraToggle(extra.id)}
                    >
                      <span className="extra-icon">{extra.icon}</span>
                      <span className="extra-name">{extra.name}</span>
                      <span className="extra-price">+₹{extra.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Special Instructions (Optional)</label>
                <textarea 
                  className="form-input"
                  rows="2"
                  placeholder="Any specific instructions for the cleaner?"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                ></textarea>
              </div>

              <div className="price-breakdown">
                <div className="price-item">
                  <span>Package Price:</span>
                  <span>₹{packages.find(p => p.id === selectedPackage)?.price || 0}</span>
                </div>
                {selectedExtras.length > 0 && (
                  <div className="price-item">
                    <span>Extras:</span>
                    <span>+₹{calculateTotal() - (packages.find(p => p.id === selectedPackage)?.price || 0)}</span>
                  </div>
                )}
                <div className="price-item total">
                  <span>Total Amount:</span>
                  <span>₹{calculateTotal()}</span>
                </div>
              </div>

              <button className="book-now-btn" onClick={handleBooking}>
                Proceed to Book
                <span className="btn-arrow">→</span>
              </button>

              <div className="secure-badge">
                <span className="secure-icon">🔒</span>
                Secure Payment • Free Cancellation
              </div>
            </div>

            {/* Professionals Preview */}
            <div className="professionals-preview">
              <h4>Featured Professionals</h4>
              {selectedProfessional && (
                <p className="selected-pro-note">Selected: {selectedProfessional.name}</p>
              )}
              <div className="professionals-list">
                {professionals.map(pro => (
                  <div key={pro.id} className="professional-mini">
                    <img src={pro.image} alt={pro.name} />
                    <div className="pro-info">
                      <h5>{pro.name}</h5>
                      <div className="pro-rating">
                        <span className="stars">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="star filled">★</span>
                          ))}
                        </span>
                        <span className="rating">{pro.rating}</span>
                      </div>
                    </div>
                    <button 
                      className="select-pro"
                      onClick={() => setSelectedProfessional(pro)}
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <section className="gallery-section">
        <div className="section-header">
          <span className="section-badge">Gallery</span>
          <h2 className="section-title">See Our <span className="title-accent">Work</span></h2>
          <p className="section-description">Take a look at some of our recent cleaning projects</p>
        </div>

        <div className="gallery-grid">
          {galleryImages.map((image, index) => (
            <div 
              key={index} 
              className="gallery-item"
              onClick={() => setCurrentImageIndex(index)}
            >
              <img src={image} alt={`Cleaning work ${index + 1}`} />
              <div className="gallery-overlay">
                <span className="view-icon">🔍</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>Ready for a Spotless Home?</h2>
          <p>Book now and get 10% off your first cleaning service</p>
          <button className="cta-btn" onClick={() => document.getElementById('booking-section').scrollIntoView({ behavior: 'smooth' })}>
            Book Your Cleaning Now
            <span className="btn-icon">→</span>
          </button>
        </div>
      </section>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content booking-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowBookingModal(false)}>×</button>
            
            <div className="modal-header">
              <div className="modal-icon">🧹</div>
              <h2>Confirm Your Booking</h2>
            </div>

            <div className="modal-body">
              <div className="booking-summary">
                <h3>Booking Summary</h3>
                
                <div className="summary-row">
                  <span>Service:</span>
                  <span>Home Cleaning - {packages.find(p => p.id === selectedPackage)?.name}</span>
                </div>
                
                <div className="summary-row">
                  <span>Date & Time:</span>
                  <span>{bookingDate} at {bookingTime}</span>
                </div>
                
                <div className="summary-row">
                  <span>Address:</span>
                  <span>{address}</span>
                </div>

                {selectedExtras.length > 0 && (
                  <div className="summary-row">
                    <span>Extras:</span>
                    <span>{selectedExtras.map(id => extras.find(e => e.id === id)?.name).join(', ')}</span>
                  </div>
                )}

                {specialInstructions && (
                  <div className="summary-row">
                    <span>Instructions:</span>
                    <span>{specialInstructions}</span>
                  </div>
                )}

                <div className="summary-total">
                  <span>Total Amount:</span>
                  <span>₹{calculateTotal()}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="modal-btn secondary" onClick={() => setShowBookingModal(false)}>
                Cancel
              </button>
              <button className="modal-btn primary" onClick={confirmBooking} disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Confirm & Pay'}
              </button>
            </div>
            {submitError && <p style={{ color: '#c62828', marginTop: '10px' }}>{submitError}</p>}
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="modal-content success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon">✓</div>
            <h2>Booking Confirmed!</h2>
            <p>Your home cleaning service has been booked successfully.</p>
            <div className="booking-details">
              <p>Booking ID: <strong>CLN{Math.floor(Math.random() * 10000)}</strong></p>
              <p>We've sent the details to your email</p>
            </div>
            <button className="modal-btn primary" onClick={() => setShowSuccessModal(false)}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeCleaning;