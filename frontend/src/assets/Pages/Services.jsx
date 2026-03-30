import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../../api';
import './Services.css';

const Services = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    address: '',
    problemDesc: ''
  });

  // Categories Data
  const categories = [
    { id: 'all', name: 'All Services', icon: '🔧' },
    { id: 'plumbing', name: 'Plumbing', icon: '🔧' },
    { id: 'electrical', name: 'Electrical', icon: '⚡' },
    { id: 'carpentry', name: 'Carpentry', icon: '🪚' },
    { id: 'cleaning', name: 'Cleaning', icon: '🧹' },
    { id: 'painting', name: 'Painting', icon: '🎨' },
    { id: 'hvac', name: 'HVAC', icon: '❄️' },
    { id: 'moving', name: 'Moving', icon: '📦' },
    { id: 'gardening', name: 'Gardening', icon: '🌱' }
  ];

  // Services Data
  const servicesData = [
    // Plumbing Services
    { id: 1, category: 'plumbing', name: 'Pipe Repair & Replacement', icon: '🔧', price: '₹89 - ₹299', rating: 4.8, reviews: 234, description: 'Fix leaking pipes, replace old pipes with modern solutions', popular: true, color: '#667eea' },
    { id: 2, category: 'plumbing', name: 'Drain Cleaning', icon: '🚿', price: '₹79 - ₹199', rating: 4.7, reviews: 189, description: 'Unclog drains, remove blockages, prevent future clogs', popular: false, color: '#667eea' },
    { id: 3, category: 'plumbing', name: 'Water Heater Installation', icon: '🔥', price: '₹299 - ₹899', rating: 4.9, reviews: 156, description: 'Install new water heaters, repair existing ones', popular: true, color: '#667eea' },
    { id: 4, category: 'plumbing', name: 'Faucet Installation', icon: '🚰', price: '₹59 - ₹149', rating: 4.6, reviews: 98, description: 'Install new faucets, repair dripping faucets', popular: false, color: '#667eea' },
    
    // Electrical Services
    { id: 5, category: 'electrical', name: 'Wiring & Rewiring', icon: '⚡', price: '₹149 - ₹599', rating: 4.9, reviews: 312, description: 'Complete house wiring, rewiring old homes', popular: true, color: '#fc7f03' },
    { id: 6, category: 'electrical', name: 'Lighting Installation', icon: '💡', price: '₹69 - ₹249', rating: 4.8, reviews: 278, description: 'Install chandeliers, LED lights, outdoor lighting', popular: false, color: '#fc7f03' },
    { id: 7, category: 'electrical', name: 'Circuit Breaker Repair', icon: '🔌', price: '₹99 - ₹349', rating: 4.7, reviews: 145, description: 'Fix tripping breakers, upgrade electrical panels', popular: true, color: '#fc7f03' },
    { id: 8, category: 'electrical', name: 'Ceiling Fan Installation', icon: '🌀', price: '₹79 - ₹199', rating: 4.8, reviews: 167, description: 'Install ceiling fans, repair fan motors', popular: false, color: '#fc7f03' },
    
    // Carpentry Services
    { id: 9, category: 'carpentry', name: 'Custom Furniture', icon: '🪑', price: '₹199 - ₹999', rating: 4.9, reviews: 89, description: 'Build custom tables, chairs, cabinets', popular: true, color: '#502222' },
    { id: 10, category: 'carpentry', name: 'Door Repair & Installation', icon: '🚪', price: '₹89 - ₹399', rating: 4.7, reviews: 134, description: 'Fix door frames, install new doors', popular: false, color: '#502222' },
    { id: 11, category: 'carpentry', name: 'Cabinet Making', icon: '🗄️', price: '₹299 - ₹899', rating: 4.8, reviews: 78, description: 'Custom kitchen cabinets, storage solutions', popular: true, color: '#502222' },
    { id: 12, category: 'carpentry', name: 'Deck Building', icon: '🪵', price: '₹499 - ₹1999', rating: 4.9, reviews: 56, description: 'Build wooden decks, patios, pergolas', popular: false, color: '#502222' },
    
    // Cleaning Services
    { id: 13, category: 'cleaning', name: 'Deep Cleaning', icon: '🧹', price: '₹149 - ₹499', rating: 4.8, reviews: 445, description: 'Complete home deep cleaning service', popular: true, color: '#667eea' },
    { id: 14, category: 'cleaning', name: 'Carpet Cleaning', icon: '🧼', price: '₹79 - ₹299', rating: 4.7, reviews: 289, description: 'Steam cleaning, stain removal', popular: false, color: '#667eea' },
    { id: 15, category: 'cleaning', name: 'Window Cleaning', icon: '🪟', price: '₹59 - ₹199', rating: 4.6, reviews: 178, description: 'Interior and exterior window cleaning', popular: false, color: '#667eea' },
    { id: 16, category: 'cleaning', name: 'Move-in/Move-out', icon: '📦', price: '₹199 - ₹599', rating: 4.9, reviews: 234, description: 'Complete cleaning for moving', popular: true, color: '#667eea' },
    
    // Painting Services
    { id: 17, category: 'painting', name: 'Interior Painting', icon: '🎨', price: '₹299 - ₹999', rating: 4.8, reviews: 367, description: 'Professional interior wall painting', popular: true, color: '#fc7f03' },
    { id: 18, category: 'painting', name: 'Exterior Painting', icon: '🏠', price: '₹599 - ₹1999', rating: 4.7, reviews: 156, description: 'House exterior painting services', popular: false, color: '#fc7f03' },
    { id: 19, category: 'painting', name: 'Cabinet Painting', icon: '🗄️', price: '₹199 - ₹599', rating: 4.6, reviews: 98, description: 'Kitchen cabinet refinishing', popular: false, color: '#fc7f03' },
    { id: 20, category: 'painting', name: 'Wallpaper Installation', icon: '📜', price: '₹149 - ₹499', rating: 4.5, reviews: 67, description: 'Professional wallpaper hanging', popular: false, color: '#fc7f03' },
    
    // HVAC Services
    { id: 21, category: 'hvac', name: 'AC Installation', icon: '❄️', price: '₹499 - ₹1499', rating: 4.9, reviews: 189, description: 'Install new air conditioning units', popular: true, color: '#502222' },
    { id: 22, category: 'hvac', name: 'AC Repair', icon: '🔧', price: '₹99 - ₹399', rating: 4.8, reviews: 278, description: 'Fix AC problems, recharge refrigerant', popular: true, color: '#502222' },
    { id: 23, category: 'hvac', name: 'Heater Installation', icon: '🔥', price: '₹399 - ₹1299', rating: 4.7, reviews: 145, description: 'Install new heating systems', popular: false, color: '#502222' },
    { id: 24, category: 'hvac', name: 'Duct Cleaning', icon: '🌀', price: '₹199 - ₹599', rating: 4.6, reviews: 123, description: 'Clean air ducts, improve air quality', popular: false, color: '#502222' },
    
    // Moving Services
    { id: 25, category: 'moving', name: 'Local Moving', icon: '📦', price: '₹299 - ₹899', rating: 4.8, reviews: 234, description: 'Move within the same city', popular: true, color: '#667eea' },
    { id: 26, category: 'moving', name: 'Long Distance Moving', icon: '🚚', price: '₹999 - ₹2999', rating: 4.7, reviews: 89, description: 'Move to different cities', popular: false, color: '#667eea' },
    { id: 27, category: 'moving', name: 'Packing Services', icon: '📦', price: '₹149 - ₹599', rating: 4.6, reviews: 145, description: 'Professional packing and unpacking', popular: false, color: '#667eea' },
    { id: 28, category: 'moving', name: 'Storage Services', icon: '🏢', price: '₹89 - ₹299/mo', rating: 4.5, reviews: 67, description: 'Secure storage solutions', popular: false, color: '#667eea' },
    
    // Gardening Services
    { id: 29, category: 'gardening', name: 'Lawn Mowing', icon: '🌿', price: '₹49 - ₹149', rating: 4.7, reviews: 345, description: 'Professional lawn maintenance', popular: true, color: '#fc7f03' },
    { id: 30, category: 'gardening', name: 'Landscaping', icon: '🌳', price: '₹299 - ₹999', rating: 4.8, reviews: 167, description: 'Complete garden design and setup', popular: true, color: '#fc7f03' },
    { id: 31, category: 'gardening', name: 'Tree Trimming', icon: '🌲', price: '₹99 - ₹399', rating: 4.6, reviews: 98, description: 'Tree pruning and removal', popular: false, color: '#fc7f03' },
    { id: 32, category: 'gardening', name: 'Garden Cleanup', icon: '🍂', price: '₹79 - ₹249', rating: 4.5, reviews: 123, description: 'Seasonal garden cleanup', popular: false, color: '#fc7f03' }
  ];

  // Filter services based on category and search
  useEffect(() => {
    let filtered = servicesData;
    
    if (activeCategory !== 'all') {
      filtered = filtered.filter(service => service.category === activeCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredServices(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, searchTerm]);

  // Popular services
  const popularServices = servicesData.filter(service => service.popular);

  const handleServiceClick = (service) => {
    setSelectedService(service);
  };

  const handleBookingInputChange = (event) => {
    const { name, value } = event.target;
    setBookingForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const mapCategoryToServiceType = (category) => {
    const categoryMap = {
      plumbing: 'Plumbing',
      electrical: 'Electrical',
      carpentry: 'Carpentry',
      cleaning: 'Cleaning',
      painting: 'Painting',
      hvac: 'HVAC',
      moving: 'Moving',
      gardening: 'Gardening'
    };
    return categoryMap[category] || 'Handyman';
  };

  const openBookingForm = (service) => {
    setSelectedService(service);
    setSubmitError('');
    setSubmitSuccess(false);
    setShowBookingForm(true);
  };

  const closeBookingForm = () => {
    setShowBookingForm(false);
  };

  const handleBookingSubmit = async (event) => {
    event.preventDefault();
    if (!selectedService) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const bookingData = {
        customer: {
          name: bookingForm.name,
          email: bookingForm.email,
          phone: bookingForm.phone
        },
        service: {
          type: mapCategoryToServiceType(selectedService.category),
          name: selectedService.name,
          description: bookingForm.problemDesc || selectedService.description,
          subService: selectedService.category
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
          setSelectedService(null);
          setBookingForm({
            name: '',
            email: '',
            phone: '',
            date: '',
            time: '',
            address: '',
            problemDesc: ''
          });
          setSubmitSuccess(false);
          navigate('/bookings');
        }, 1200);
      }
    } catch (error) {
      setSubmitError(error.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setSelectedService(null);
  };

  return (
    <div className="services-page">
      {/* Hero Section */}
      <section className="services-hero">
        <div className="services-hero-particles">
          {[...Array(15)].map((_, i) => (
            <div key={i} className={`service-particle particle-${i + 1}`}></div>
          ))}
        </div>
        
        <div className="services-hero-content">
          <h1 className="services-hero-title">
            Our <span className="hero-highlight">Premium</span> Services
          </h1>
          <p className="services-hero-description">
            Professional home services tailored to your needs. Book with confidence.
          </p>
          <div className="services-hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-number">50+</span>
              <span className="hero-stat-label">Services</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">1500+</span>
              <span className="hero-stat-label">Professionals</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">24/7</span>
              <span className="hero-stat-label">Support</span>
            </div>
          </div>
        </div>
        
        <div className="services-hero-wave">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,42.7C960,43,1056,53,1152,58.7C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="services-filter-section">
        <div className="filter-container">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search for a service..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="categories-wrapper">
            <div className="categories-slider">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`category-chip ${activeCategory === category.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-name">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services Section */}
      {activeCategory === 'all' && !searchTerm && (
        <section className="popular-services">
          <div className="popular-container">
            <div className="section-header">
              <span className="section-badge">Trending</span>
              <h2 className="section-title">
                Most <span className="title-accent">Popular</span> Services
              </h2>
              <p className="section-description">
                Services our customers love the most
              </p>
            </div>

            <div className="popular-grid">
              {popularServices.slice(0, 4).map(service => (
                <div key={service.id} className="popular-card" onClick={() => handleServiceClick(service)}>
                  <div className="popular-card-inner">
                    <div className="popular-card-front" style={{ '--card-color': service.color }}>
                      <div className="popular-icon-wrapper">
                        <span className="popular-icon">{service.icon}</span>
                        <div className="popular-icon-glow"></div>
                      </div>
                      <h3 className="popular-title">{service.name}</h3>
                      <div className="popular-rating">
                        <span className="popular-stars">★</span>
                        <span className="popular-rating-value">{service.rating}</span>
                        <span className="popular-reviews">({service.reviews})</span>
                      </div>
                      <div className="popular-price">{service.price}</div>
                      <div className="popular-badge">🔥 Popular</div>
                    </div>
                    <div className="popular-card-back" style={{ '--card-color': service.color }}>
                      <span className="popular-back-tag">Top Rated</span>
                      <h3 className="popular-back-title">{service.name}</h3>
                      <p className="popular-back-description">{service.description}</p>
                      <div className="popular-back-meta">
                        <span>⭐ {service.rating} ({service.reviews})</span>
                        <span>{service.price}</span>
                      </div>
                      <span className="popular-back-cta">Click to view details</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Services Section */}
      <section className="all-services-section">
        <div className="services-container">
          <div className="section-header">
            <h2 className="section-title">
              {activeCategory === 'all' ? 'All ' : categories.find(c => c.id === activeCategory)?.name + ' '}
              <span className="title-accent">Services</span>
            </h2>
            <p className="section-description">
              {filteredServices.length} services available for you
            </p>
          </div>

          {filteredServices.length > 0 ? (
            <div className="services-grid-modern">
              {filteredServices.map(service => (
                <div key={service.id} className="service-modern-card" onClick={() => handleServiceClick(service)}>
                  <div className="service-card-content" style={{ '--service-color': service.color }}>
                    <div className="service-card-header">
                      <div className="service-card-icon">
                        <span className="service-emoji">{service.icon}</span>
                        <div className="service-icon-ring"></div>
                      </div>
                      {service.popular && <span className="service-popular-tag">Popular</span>}
                    </div>
                    
                    <h3 className="service-card-title">{service.name}</h3>
                    <p className="service-card-description">{service.description}</p>
                    
                    <div className="service-card-footer">
                      <div className="service-rating">
                        <span className="rating-star">★</span>
                        <span className="rating-value">{service.rating}</span>
                        <span className="rating-count">({service.reviews})</span>
                      </div>
                      <div className="service-price">{service.price}</div>
                    </div>
                    
                    <div className="service-card-hover">
                      <button className="service-book-btn" onClick={(event) => { event.stopPropagation(); openBookingForm(service); }}>Book Now →</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <span className="no-results-icon">🔍</span>
              <h3>No services found</h3>
              <p>Try adjusting your search or filter</p>
              <button className="clear-filter-btn" onClick={() => { setActiveCategory('all'); setSearchTerm(''); }}>
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {filteredServices.length > 0 && (
            <div className="pagination">
              <button className="pagination-btn active">1</button>
              <button className="pagination-btn">2</button>
              <button className="pagination-btn">3</button>
              <button className="pagination-btn">4</button>
              <button className="pagination-btn">5</button>
              <button className="pagination-btn next">Next →</button>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-us">
        <div className="why-container">
          <div className="section-header">
            <span className="section-badge">Why Us</span>
            <h2 className="section-title">
              Why Choose <span className="title-accent">KaryON</span>
            </h2>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">✅</span>
                <div className="feature-icon-glow"></div>
              </div>
              <h3 className="feature-title">Verified Professionals</h3>
              <p className="feature-description">All our service providers are background checked and verified</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">💰</span>
                <div className="feature-icon-glow"></div>
              </div>
              <h3 className="feature-title">Best Price Guarantee</h3>
              <p className="feature-description">Transparent pricing with fair, competitive quotes</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">⚡</span>
                <div className="feature-icon-glow"></div>
              </div>
              <h3 className="feature-title">Quick Response</h3>
              <p className="feature-description">Service within 24 hours or it's free</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">🛡️</span>
                <div className="feature-icon-glow"></div>
              </div>
              <h3 className="feature-title">100% Satisfaction</h3>
              <p className="feature-description">Money-back guarantee if you're not satisfied</p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories Grid */}
      <section className="categories-grid-section">
        <div className="categories-container">
          <div className="section-header">
            <h2 className="section-title">
              Browse by <span className="title-accent">Category</span>
            </h2>
          </div>

          <div className="categories-modern-grid">
            {categories.filter(c => c.id !== 'all').map(category => (
              <div key={category.id} className="category-modern-card" onClick={() => setActiveCategory(category.id)}>
                <div className="category-modern-content">
                  <span className="category-modern-icon">{category.icon}</span>
                  <h3 className="category-modern-name">{category.name}</h3>
                  <span className="category-modern-count">
                    {servicesData.filter(s => s.category === category.id).length} services
                  </span>
                </div>
                <div className="category-modern-shine"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Modal */}
      {selectedService && !showBookingForm && (
        <div className="service-modal" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            
            <div className="modal-header" style={{ '--modal-color': selectedService.color }}>
              <div className="modal-icon-wrapper">
                <span className="modal-icon">{selectedService.icon}</span>
              </div>
              <h2 className="modal-title">{selectedService.name}</h2>
              <div className="modal-rating">
                <span className="modal-stars">★</span>
                <span className="modal-rating-value">{selectedService.rating}</span>
                <span className="modal-reviews">({selectedService.reviews} reviews)</span>
              </div>
            </div>

            <div className="modal-body">
              <p className="modal-description">{selectedService.description}</p>
              
              <div className="modal-details">
                <div className="modal-detail-item">
                  <span className="detail-label">Price Range</span>
                  <span className="detail-value price">{selectedService.price}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="detail-label">Category</span>
                  <span className="detail-value">{categories.find(c => c.id === selectedService.category)?.name}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="detail-label">Availability</span>
                  <span className="detail-value available">24/7</span>
                </div>
              </div>

              <div className="modal-features">
                <h3>What's included:</h3>
                <ul>
                  <li>✓ Professional service provider</li>
                  <li>✓ Free estimate</li>
                  <li>✓ 30-day service warranty</li>
                  <li>✓ Emergency support available</li>
                </ul>
              </div>

              <div className="modal-actions">
                <button className="modal-book-btn" onClick={() => openBookingForm(selectedService)}>Book This Service</button>
                <button className="modal-chat-btn">Chat with Pro</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBookingForm && selectedService && (
        <div className="service-modal" onClick={closeBookingForm}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={closeBookingForm}>×</button>
            <div className="modal-header" style={{ '--modal-color': selectedService.color }}>
              <div className="modal-icon-wrapper">
                <span className="modal-icon">{selectedService.icon}</span>
              </div>
              <h2 className="modal-title">Book {selectedService.name}</h2>
            </div>

            <div className="modal-body">
              <form onSubmit={handleBookingSubmit} className="services-booking-form">
                <div className="services-form-group">
                  <label>Full Name</label>
                  <input type="text" name="name" value={bookingForm.name} onChange={handleBookingInputChange} required />
                </div>
                <div className="services-form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={bookingForm.email} onChange={handleBookingInputChange} required />
                </div>
                <div className="services-form-group">
                  <label>Phone</label>
                  <input type="tel" name="phone" value={bookingForm.phone} onChange={handleBookingInputChange} required />
                </div>
                <div className="services-form-group">
                  <label>Date</label>
                  <input type="date" name="date" value={bookingForm.date} onChange={handleBookingInputChange} min={new Date().toISOString().split('T')[0]} required />
                </div>
                <div className="services-form-group">
                  <label>Time</label>
                  <input type="time" name="time" value={bookingForm.time} onChange={handleBookingInputChange} required />
                </div>
                <div className="services-form-group">
                  <label>Address</label>
                  <textarea name="address" value={bookingForm.address} onChange={handleBookingInputChange} rows="2" required></textarea>
                </div>
                <div className="services-form-group">
                  <label>Issue Description</label>
                  <textarea name="problemDesc" value={bookingForm.problemDesc} onChange={handleBookingInputChange} rows="3" placeholder="Tell us what you need help with"></textarea>
                </div>

                {submitError && <p className="services-form-message error">{submitError}</p>}
                {submitSuccess && <p className="services-form-message success">Booking created successfully. Redirecting...</p>}

                <div className="services-form-actions">
                  <button type="submit" className="modal-book-btn services-submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Confirm Booking'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;