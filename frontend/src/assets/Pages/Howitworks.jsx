import React, { useState, useEffect, useRef } from 'react';
import './Howitworks.css';

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState('customer'); // 'customer' or 'professional'
  const [activeStep, setActiveStep] = useState(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const stepsRef = useRef([]);

  // Intersection Observer for step animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.3, rootMargin: '0px' }
    );

    stepsRef.current.forEach((step) => {
      if (step) observer.observe(step);
    });

    return () => observer.disconnect();
  }, [activeTab]);

  // Customer Steps Data
  const customerSteps = [
    {
      id: 1,
      title: "Choose Your Service",
      description: "Browse through our wide range of professional home services. From plumbing to painting, find exactly what you need.",
      icon: "🔍",
      details: [
        "Select from 50+ services",
        "View professional profiles",
        "Check availability in your area",
        "Compare prices and ratings"
      ],
      color: "#667eea",
      image: "🔧"
    },
    {
      id: 2,
      title: "Schedule Appointment",
      description: "Pick a date and time that works best for you. Our professionals are available 24/7, including weekends and holidays.",
      icon: "📅",
      details: [
        "Choose convenient time slot",
        "Instant confirmation",
        "Flexible rescheduling",
        "Emergency booking available"
      ],
      color: "#fc7f03",
      image: "⏰"
    },
    {
      id: 3,
      title: "Get Matched with Pro",
      description: "We connect you with the best-matched professional based on your requirements, location, and schedule.",
      icon: "🤝",
      details: [
        "Background verified pros",
        "Skills-matched to your needs",
        "Real-time tracking",
        "Pro arrives on time"
      ],
      color: "#502222",
      image: "👨‍🔧"
    },
    {
      id: 4,
      title: "Service Delivered",
      description: "Professional completes the work with quality assurance. You can track progress and communicate in real-time.",
      icon: "✅",
      details: [
        "Quality checked service",
        "Digital work report",
        "Secure payment",
        "30-day warranty"
      ],
      color: "#667eea",
      image: "🎯"
    },
    {
      id: 5,
      title: "Rate & Review",
      description: "Share your experience and help us maintain quality. Your feedback helps other customers make informed decisions.",
      icon: "⭐",
      details: [
        "Rate your experience",
        "Write a review",
        "Earn reward points",
        "Help improve service"
      ],
      color: "#fc7f03",
      image: "📝"
    }
  ];

  // Professional Steps Data
  const professionalSteps = [
    {
      id: 1,
      title: "Sign Up & Verify",
      description: "Create your professional profile and complete our verification process. We ensure only qualified pros join our network.",
      icon: "📝",
      details: [
        "Quick registration",
        "Background verification",
        "Skills assessment",
        "Document upload"
      ],
      color: "#667eea",
      image: "✅"
    },
    {
      id: 2,
      title: "Complete Your Profile",
      description: "Showcase your expertise with detailed profile, portfolio, certifications, and service areas.",
      icon: "👤",
      details: [
        "Add work samples",
        "List certifications",
        "Set service radius",
        "Define availability"
      ],
      color: "#fc7f03",
      image: "📋"
    },
    {
      id: 3,
      title: "Get Job Notifications",
      description: "Receive job alerts matching your skills and location. Choose jobs that fit your schedule and preferences.",
      icon: "🔔",
      details: [
        "Real-time alerts",
        "Smart matching",
        "Set preferences",
        "Choose your jobs"
      ],
      color: "#502222",
      image: "📱"
    },
    {
      id: 4,
      title: "Accept & Complete Jobs",
      description: "Accept jobs, communicate with customers, and deliver exceptional service. Track earnings in real-time.",
      icon: "💼",
      details: [
        "Flexible schedule",
        "In-app chat",
        "Digital invoices",
        "Instant payments"
      ],
      color: "#667eea",
      image: "💰"
    },
    {
      id: 5,
      title: "Get Paid & Grow",
      description: "Receive secure payments and build your reputation. Top-rated pros get more job opportunities.",
      icon: "💵",
      details: [
        "Weekly payouts",
        "Performance bonuses",
        "Rating benefits",
        "Business growth"
      ],
      color: "#fc7f03",
      image: "📈"
    }
  ];

  // Features Data
  const features = [
    {
      icon: "🔒",
      title: "Secure Payments",
      description: "Your money is held securely until the job is completed to your satisfaction.",
      color: "#667eea"
    },
    {
      icon: "⭐",
      title: "Rated Professionals",
      description: "All pros are rated by real customers, so you know exactly what to expect.",
      color: "#fc7f03"
    },
    {
      icon: "🛡️",
      title: "Insurance Covered",
      description: "Every service is covered by our insurance policy for complete peace of mind.",
      color: "#502222"
    },
    {
      icon: "💬",
      title: "24/7 Support",
      description: "Our customer support team is always available to help you with anything.",
      color: "#667eea"
    },
    {
      icon: "⚡",
      title: "Quick Response",
      description: "Get matched with a professional within minutes, not hours.",
      color: "#fc7f03"
    },
    {
      icon: "🎯",
      title: "Satisfaction Guaranteed",
      description: "Not happy with the service? We'll make it right or refund your money.",
      color: "#502222"
    }
  ];

  // FAQ Data
  const faqs = [
    {
      question: "How quickly can I get a service?",
      answer: "For most services, you can get a professional within 2-4 hours. Emergency services are available 24/7 with response times under 1 hour.",
      category: "customer"
    },
    {
      question: "Are the professionals background checked?",
      answer: "Yes, every professional on our platform undergoes thorough background verification including identity, experience, and police verification.",
      category: "both"
    },
    {
      question: "How do I get paid as a professional?",
      answer: "Payments are processed weekly via direct bank transfer. You can track all your earnings in real-time through your dashboard.",
      category: "professional"
    },
    {
      question: "What if I'm not satisfied with the service?",
      answer: "We have a 100% satisfaction guarantee. If you're not happy, we'll either send another professional or issue a full refund.",
      category: "customer"
    },
    {
      question: "Can I cancel or reschedule?",
      answer: "Yes, you can cancel or reschedule up to 2 hours before the scheduled time without any charges.",
      category: "both"
    },
    {
      question: "How do I become a professional?",
      answer: "Simply sign up on our platform, complete your profile, and go through our verification process. Once approved, you can start accepting jobs.",
      category: "professional"
    }
  ];

  // Video Section Data
  const videoData = {
    title: "See How It Works",
    description: "Watch this short video to understand how easy it is to get your home services done with KaryON.",
    thumbnail: "🎥"
  };

  // Testimonials Data
  const _testimonials = [
    {
      name: "David Miller",
      role: "Happy Customer",
      content: "The process is so smooth! I booked a plumber and within 2 hours, the job was done. Amazing service!",
      rating: 5,
      image: "👨",
      type: "customer"
    },
    {
      name: "Jennifer Adams",
      role: "Professional Cleaner",
      content: "As a professional, this platform has transformed my business. I get consistent work and get paid on time.",
      rating: 5,
      image: "👩",
      type: "professional"
    },
    {
      name: "Robert Chen",
      role: "Homeowner",
      content: "The step-by-step process is so clear. I always know what's happening and when. Highly recommended!",
      rating: 5,
      image: "👨‍🦰",
      type: "customer"
    }
  ];

  return (
    <div className="how-it-works-page">
      {/* Hero Section */}
      <section className="how-hero">
        <div className="how-hero-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`how-particle particle-${i + 1}`}></div>
          ))}
        </div>

        <div className="how-hero-content">
          <div className="hero-badge">
            <span className="badge-pulse"></span>
            Simple & Transparent
          </div>

          <h1 className="how-hero-title">
            <span className="title-line">How It</span>
            <span className="title-highlight">Works</span>
          </h1>

          <p className="how-hero-description">
            Whether you're a customer looking for reliable service or a professional wanting to grow your business,
            we've made the process simple and straightforward.
          </p>

          <div className="hero-cta">
            <button className="cta-btn-primary" onClick={() => setActiveTab('customer')}>
              <span>I Need a Service</span>
              <span className="btn-icon">→</span>
            </button>
            <button className="cta-btn-secondary" onClick={() => setActiveTab('professional')}>
              <span>I'm a Professional</span>
              <span className="btn-icon">→</span>
            </button>
          </div>
        </div>

        <div className="how-hero-wave">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,42.7C960,43,1056,53,1152,58.7C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* User Type Toggle */}
      <section className="user-toggle-section">
        <div className="toggle-container">
          <div className="user-toggle">
            <button
              className={`toggle-btn ${activeTab === 'customer' ? 'active' : ''}`}
              onClick={() => setActiveTab('customer')}
            >
              <span className="toggle-icon">👤</span>
              <div className="toggle-text">
                <span className="toggle-label">For Customers</span>
                <span className="toggle-desc">I need home services</span>
              </div>
            </button>
            <button
              className={`toggle-btn ${activeTab === 'professional' ? 'active' : ''}`}
              onClick={() => setActiveTab('professional')}
            >
              <span className="toggle-icon">👨‍🔧</span>
              <div className="toggle-text">
                <span className="toggle-label">For Professionals</span>
                <span className="toggle-desc">I offer services</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="steps-section">
        <div className="steps-container">
          <div className="section-header">
            <span className="section-badge">
              {activeTab === 'customer' ? 'Your Journey' : 'Your Path to Success'}
            </span>
            <h2 className="section-title">
              {activeTab === 'customer' ? (
                <>Getting Your Service Done in <span className="title-accent">5 Simple Steps</span></>
              ) : (
                <>Start Earning with <span className="title-accent">5 Easy Steps</span></>
              )}
            </h2>
            <p className="section-description">
              {activeTab === 'customer' 
                ? 'From booking to completion, we make it effortless'
                : 'Join our network of trusted professionals and grow your business'
              }
            </p>
          </div>

          <div className="steps-timeline">
            {(activeTab === 'customer' ? customerSteps : professionalSteps).map((step, index) => (
              <div
                key={step.id}
                className={`step-item ${index % 2 === 0 ? 'left' : 'right'}`}
                ref={el => stepsRef.current[index] = el}
                style={{ '--step-color': step.color }}
              >
                <div className="step-number-wrapper">
                  <div className="step-number" style={{ backgroundColor: step.color }}>
                    <span>{step.id}</span>
                  </div>
                  <div className="step-connector"></div>
                </div>

                <div 
                  className={`step-card ${activeStep === step.id ? 'expanded' : ''}`}
                  onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
                >
                  <div className="step-card-header">
                    <div className="step-icon-wrapper">
                      <span className="step-icon">{step.icon}</span>
                      <div className="step-icon-glow" style={{ background: `radial-gradient(circle, ${step.color} 0%, transparent 70%)` }}></div>
                    </div>
                    <h3 className="step-title">{step.title}</h3>
                  </div>

                  <p className="step-description">{step.description}</p>

                  <div className="step-details">
                    <h4>What happens:</h4>
                    <ul>
                      {step.details.map((detail, i) => (
                        <li key={i}>
                          <span className="detail-check">✓</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="step-hover-indicator">
                    <span>{activeStep === step.id ? 'Click to collapse' : 'Click for details'}</span>
                    <span className={`indicator-icon ${activeStep === step.id ? 'rotate' : ''}`}>↓</span>
                  </div>

                  <div className="step-shine"></div>
                </div>

                <div className="step-visual">
                  <span className="step-visual-icon">{step.image}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="video-section">
        <div className="video-container">
          <div className="video-content">
            <h2 className="video-title">
              Watch How It <span className="title-accent">Works</span>
            </h2>
            <p className="video-description">{videoData.description}</p>

            <div className="video-wrapper">
              <div className={`video-placeholder ${videoPlaying ? 'hidden' : ''}`}>
                <span className="video-icon">{videoData.thumbnail}</span>
                <button 
                  className="video-play-btn"
                  onClick={() => setVideoPlaying(true)}
                >
                  <span className="play-icon">▶</span>
                  <span>Play Video</span>
                </button>
                <div className="video-glow"></div>
              </div>

              {videoPlaying && (
                <div className="video-frame">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    title="How It Works"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                  <button 
                    className="video-close"
                    onClick={() => setVideoPlaying(false)}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="how-features">
        <div className="features-container">
          <div className="section-header">
            <span className="section-badge">Why Choose Us</span>
            <h2 className="section-title">
              The <span className="title-accent">KaryON</span> Advantage
            </h2>
            <p className="section-description">
              What makes our platform the preferred choice for thousands of users
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card" style={{ '--feature-color': feature.color }}>
                <div className="feature-icon-wrapper">
                  <span className="feature-icon">{feature.icon}</span>
                  <div className="feature-glow"></div>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-shine"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="comparison-section">
        <div className="comparison-container">
          <div className="section-header">
            <span className="section-badge">Why We're Different</span>
            <h2 className="section-title">
              KaryON vs <span className="title-accent">Traditional</span> Services
            </h2>
          </div>

          <div className="comparison-grid">
            <div className="comparison-card traditional">
              <h3 className="comparison-title">Traditional Way</h3>
              <ul className="comparison-list">
                <li className="negative">
                  <span className="list-icon">✗</span>
                  <span>Hard to find reliable professionals</span>
                </li>
                <li className="negative">
                  <span className="list-icon">✗</span>
                  <span>No price transparency</span>
                </li>
                <li className="negative">
                  <span className="list-icon">✗</span>
                  <span>Long waiting times</span>
                </li>
                <li className="negative">
                  <span className="list-icon">✗</span>
                  <span>No quality guarantee</span>
                </li>
                <li className="negative">
                  <span className="list-icon">✗</span>
                  <span>Cash only payments</span>
                </li>
              </ul>
            </div>

            <div className="comparison-card karyon">
              <h3 className="comparison-title">KaryON Way</h3>
              <ul className="comparison-list">
                <li className="positive">
                  <span className="list-icon">✓</span>
                  <span>Verified professionals</span>
                </li>
                <li className="positive">
                  <span className="list-icon">✓</span>
                  <span>Upfront pricing</span>
                </li>
                <li className="positive">
                  <span className="list-icon">✓</span>
                  <span>Quick response (within 2hrs)</span>
                </li>
                <li className="positive">
                  <span className="list-icon">✓</span>
                  <span>100% satisfaction guarantee</span>
                </li>
                <li className="positive">
                  <span className="list-icon">✓</span>
                  <span>Secure digital payments</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="how-faq">
        <div className="faq-container">
          <div className="section-header">
            <span className="section-badge">Got Questions?</span>
            <h2 className="section-title">
              Frequently Asked <span className="title-accent">Questions</span>
            </h2>
          </div>

          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-card">
                <div className="faq-icon">
                  {faq.category === 'customer' && '👤'}
                  {faq.category === 'professional' && '👨‍🔧'}
                  {faq.category === 'both' && '🤝'}
                </div>
                <h3 className="faq-question">{faq.question}</h3>
                <p className="faq-answer">{faq.answer}</p>
                <div className="faq-category-tag">
                  {faq.category === 'customer' && 'For Customers'}
                  {faq.category === 'professional' && 'For Professionals'}
                  {faq.category === 'both' && 'For Everyone'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      

      {/* CTA Section */}
      
    </div>
  );
};

export default HowItWorks;