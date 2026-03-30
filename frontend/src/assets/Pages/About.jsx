import React, { useState, useEffect, useRef } from 'react';
import './About.css';
import { publicAPI } from '../../api';

const AboutUs = () => {
  const foundingYear = 2026;
  const currentYear = new Date().getFullYear();
  const yearsInService = Math.max(1, currentYear - foundingYear + 1);

  const [activeTab, setActiveTab] = useState('mission');
  const [activeTeamMember, setActiveTeamMember] = useState(null);
  const [counterTargets, setCounterTargets] = useState({
    customers: 0,
    professionals: 0,
    services: 50000,
    cities: 25,
    years: yearsInService
  });
  const [counterValues, setCounterValues] = useState({
    customers: 0,
    professionals: 0,
    services: 0,
    cities: 0,
    years: yearsInService
  });
  
  const statsRef = useRef(null);
  const timelineRef = useRef(null);
  const parallaxRef = useRef(null);

  // Fetch live platform stats for customer/professional counts.
  useEffect(() => {
    let isMounted = true;

    const fetchPublicStats = async () => {
      try {
        const response = await publicAPI.getPlatformStats();
        const customersCount = Number(response?.data?.totalUsers ?? 0);
        const professionalsCount = Number(response?.data?.professionals ?? 0);

        if (!isMounted) {
          return;
        }

        setCounterTargets(prev => ({
          ...prev,
          customers: customersCount,
          professionals: professionalsCount,
          years: yearsInService
        }));

        // Keep hero numbers real even before scroll-triggered animation starts.
        setCounterValues(prev => ({
          ...prev,
          customers: Math.max(prev.customers, customersCount),
          professionals: Math.max(prev.professionals, professionalsCount),
          years: yearsInService
        }));
      } catch {
        // Fail silently so About page remains usable even if stats API is unavailable.
      }
    };

    fetchPublicStats();
    const refreshTimer = setInterval(fetchPublicStats, 30000);

    return () => {
      isMounted = false;
      clearInterval(refreshTimer);
    };
  }, [yearsInService]);

  // Counter Animation
  useEffect(() => {
    const targets = counterTargets;

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
  }, [counterTargets]);

  // Parallax Effect
  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrolled = window.scrollY;
        parallaxRef.current.style.transform = `translateY(${scrolled * 0.3}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Timeline Animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.5 }
    );

    if (timelineRef.current) {
      observer.observe(timelineRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Team Data
  const teamMembers = [
    {
      id: 1,
      name: "John Anderson",
      role: "Founder & CEO",
      image: "👨‍💼",
      bio: "With 15+ years in home services, John founded KaryON to revolutionize how people maintain their homes.",
      expertise: ["Strategic Planning", "Business Development", "Customer Relations"],
      social: { linkedin: "#", twitter: "#", email: "#" },
      color: "#667eea"
    },
    {
      id: 2,
      name: "Sarah Martinez",
      role: "Chief Operations Officer",
      image: "👩‍💼",
      bio: "Sarah ensures every service meets our quality standards. She leads our network of 1500+ professionals.",
      expertise: ["Operations Management", "Quality Control", "Team Leadership"],
      social: { linkedin: "#", twitter: "#", email: "#" },
      color: "#fc7f03"
    },
    {
      id: 3,
      name: "Michael Chen",
      role: "Head of Technology",
      image: "👨‍💻",
      bio: "Michael built our platform from ground up, making it easy for customers to book services seamlessly.",
      expertise: ["Full Stack Development", "UX Design", "System Architecture"],
      social: { linkedin: "#", twitter: "#", email: "#" },
      color: "#502222"
    },
    {
      id: 4,
      name: "Emily Rodriguez",
      role: "Customer Experience Director",
      image: "👩‍💼",
      bio: "Emily ensures every customer interaction is exceptional. She leads our 24/7 support team.",
      expertise: ["Customer Service", "Training", "Process Improvement"],
      social: { linkedin: "#", twitter: "#", email: "#" },
      color: "#667eea"
    },
    {
      id: 5,
      name: "David Kim",
      role: "Head of Professional Network",
      image: "👨‍🔧",
      bio: "David recruits and vets all our professionals, ensuring only the best serve our customers.",
      expertise: ["Recruitment", "Vetting", "Training"],
      social: { linkedin: "#", twitter: "#", email: "#" },
      color: "#fc7f03"
    },
    {
      id: 6,
      name: "Lisa Thompson",
      role: "Marketing Director",
      image: "👩‍🎨",
      bio: "Lisa tells our story and connects us with customers who need reliable home services.",
      expertise: ["Digital Marketing", "Brand Strategy", "Content Creation"],
      social: { linkedin: "#", twitter: "#", email: "#" },
      color: "#502222"
    }
  ];

  // Timeline Data
  const _timelineEvents = [
    {
      year: "2019",
      title: "The Beginning",
      description: "KaryON was founded with a simple mission: connect homeowners with trusted professionals.",
      icon: "🚀",
      color: "#667eea"
    },
    {
      year: "2020",
      title: "First 1000 Customers",
      description: "We served our first 1000 customers and expanded to 5 major cities.",
      icon: "🎯",
      color: "#fc7f03"
    },
    {
      year: "2021",
      title: "Professional Network Grows",
      description: "500+ professionals joined our platform, offering 15+ different services.",
      icon: "👥",
      color: "#502222"
    },
    {
      year: "2022",
      title: "Nationwide Expansion",
      description: "We expanded to 25 cities, serving over 10,000 happy customers.",
      icon: "🌍",
      color: "#667eea"
    },
    {
      year: "2023",
      title: "50,000 Services Completed",
      description: "Milestone achievement: 50,000 successful services delivered with 4.9★ rating.",
      icon: "🏆",
      color: "#fc7f03"
    },
    {
      year: "2024",
      title: "The Future",
      description: "Aiming to expand to 50 cities and introduce AI-powered service matching.",
      icon: "🔮",
      color: "#502222"
    }
  ];

  // Values Data
  const values = [
    {
      icon: "🔒",
      title: "Trust & Safety",
      description: "Every professional is background verified. Your safety is our priority.",
      color: "#667eea"
    },
    {
      icon: "⭐",
      title: "Quality First",
      description: "We never compromise on quality. All services come with satisfaction guarantee.",
      color: "#fc7f03"
    },
    {
      icon: "🤝",
      title: "Customer First",
      description: "Your happiness drives everything we do. 24/7 support always available.",
      color: "#502222"
    },
    {
      icon: "💡",
      title: "Innovation",
      description: "Constantly improving our platform to make home services effortless.",
      color: "#667eea"
    },
    {
      icon: "🌱",
      title: "Sustainability",
      description: "Eco-friendly practices and responsible service delivery.",
      color: "#fc7f03"
    },
    {
      icon: "🤲",
      title: "Community",
      description: "Giving back to the communities we serve through various initiatives.",
      color: "#502222"
    }
  ];

  // Testimonials Data
  const testimonials = [
    {
      name: "Robert Johnson",
      role: "Homeowner",
      content: "The professionalism and quality of service is unmatched. I've been using KaryON for 3 years now.",
      rating: 5,
      image: "👨",
      color: "#667eea"
    },
    {
      name: "Patricia Lee",
      role: "Property Manager",
      content: "Managing 20+ properties became easy with KaryON. Their professionals are always reliable.",
      rating: 5,
      image: "👩",
      color: "#fc7f03"
    },
    {
      name: "James Wilson",
      role: "Professional Partner",
      content: "As a professional, KaryON helped me grow my business exponentially. Best decision ever!",
      rating: 5,
      image: "👨‍🔧",
      color: "#502222"
    }
  ];

  // Achievements Data
  const achievements = [
    { icon: "🏆", title: "Best Home Services Platform 2023", organization: "Tech Awards" },
    { icon: "⭐", title: "4.9★ Average Rating", organization: "Customer Reviews" },
    { icon: "📈", title: "200% Year-over-Year Growth", organization: "Business Report" },
    { icon: "🌍", title: "Present in 25+ Cities", organization: "Nationwide" },
    { icon: "👥", title: "1500+ Verified Professionals", organization: "Network" },
    { icon: "💚", title: "Great Place to Work Certified", organization: "2023-2024" }
  ];

  const heroYearsDisplay = Math.max(counterValues.years, yearsInService);
  const heroCustomersDisplay = Math.max(counterValues.customers, counterTargets.customers);
  const heroProfessionalsDisplay = Math.max(counterValues.professionals, counterTargets.professionals);

  return (
    <div className="about-page">
      {/* Hero Section with Parallax */}
      <section className="about-hero">
        <div className="about-hero-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`about-particle particle-${i + 1}`}></div>
          ))}
        </div>
        
        <div className="about-hero-background" ref={parallaxRef}>
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>

        <div className="about-hero-content">
          <div className="hero-badge">
            <span className="badge-pulse"></span>
            Since {foundingYear}
          </div>
          
          <h1 className="about-hero-title">
            <span className="title-line">We're on a Mission to</span>
            <span className="title-highlight">Transform Home Services</span>
          </h1>
          
          <p className="about-hero-description">
            KaryON connects you with trusted professionals for all your home needs. 
            We're building a community of reliable service providers and happy homeowners.
          </p>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">{heroYearsDisplay}+</span>
              <span className="stat-label">Years</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">{heroCustomersDisplay.toLocaleString()}+</span>
              <span className="stat-label">Users</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">{heroProfessionalsDisplay.toLocaleString()}+</span>
              <span className="stat-label">Pros</span>
            </div>
          </div>
        </div>

        <div className="about-hero-wave">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,42.7C960,43,1056,53,1152,58.7C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="story-section">
        <div className="story-container">
          <div className="story-grid">
            <div className="story-content">
              <span className="story-badge">Our Story</span>
              <h2 className="story-title">
                From a Practical Idea to a <span className="title-accent">Launch-Ready Platform</span>
              </h2>
              <p className="story-text">
                KaryON began with a simple observation: finding trusted home service professionals is still difficult in many places.
                We are building a cleaner, faster way for homeowners to discover verified experts and book services with confidence.
              </p>
              <p className="story-text">
                We are currently in the pre-launch phase, focused on onboarding professionals, refining booking flows,
                and improving service quality standards before opening up for wider public rollout.
              </p>
              
              <div className="story-features">
                <div className="story-feature">
                  <span className="feature-check">✓</span>
                  <span>Verified professionals onboarding</span>
                </div>
                <div className="story-feature">
                  <span className="feature-check">✓</span>
                  <span>Transparent booking and pricing flow</span>
                </div>
                <div className="story-feature">
                  <span className="feature-check">✓</span>
                  <span>Faster service request matching</span>
                </div>
                <div className="story-feature">
                  <span className="feature-check">✓</span>
                  <span>Dedicated post-booking support</span>
                </div>
              </div>

              <div className="story-cta">
                <button className="story-btn">
                  <span>Be an Early User</span>
                  <span className="btn-icon">→</span>
                </button>
              </div>
            </div>

            <div className="story-visual">
              <div className="story-card">
                <div className="story-card-content">
                  <div className="story-icon">💡</div>
                  <h3>2025</h3>
                  <p>The Idea</p>
                </div>
              </div>
              <div className="story-card">
                <div className="story-card-content">
                  <div className="story-icon">🚀</div>
                  <h3>2026</h3>
                  <p>Platform Build</p>
                </div>
              </div>
              <div className="story-card">
                <div className="story-card-content">
                  <div className="story-icon">🌍</div>
                  <h3>2026</h3>
                  <p>Pilot Onboarding</p>
                </div>
              </div>
              <div className="story-card">
                <div className="story-card-content">
                  <div className="story-icon">🏆</div>
                  <h3>Soon</h3>
                  <p>Public Launch</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Tabs */}
      <section className="mission-section">
        <div className="mission-container">
          <div className="tabs-container">
            <button
              className={`tab-btn ${activeTab === 'mission' ? 'active' : ''}`}
              onClick={() => setActiveTab('mission')}
            >
              <span className="tab-icon">🎯</span>
              <span>Our Mission</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'vision' ? 'active' : ''}`}
              onClick={() => setActiveTab('vision')}
            >
              <span className="tab-icon">👁️</span>
              <span>Our Vision</span>
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'mission' && (
              <div className="mission-content fade-in">
                <div className="mission-grid">
                  <div className="mission-text">
                    <h3>Empowering Homes, Enabling Professionals</h3>
                    <p>
                      Our mission is to revolutionize home services by creating a seamless platform 
                      that connects homeowners with trusted, verified professionals. We strive to make 
                      home maintenance stress-free, reliable, and accessible to everyone.
                    </p>
                    <ul className="mission-list">
                      <li>
                        <span className="list-icon">✓</span>
                        <span>Provide reliable, quality home services</span>
                      </li>
                      <li>
                        <span className="list-icon">✓</span>
                        <span>Create sustainable livelihoods for professionals</span>
                      </li>
                      <li>
                        <span className="list-icon">✓</span>
                        <span>Build a community of trust and excellence</span>
                      </li>
                      <li>
                        <span className="list-icon">✓</span>
                        <span>Innovate constantly to improve customer experience</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mission-visual">
                    <div className="mission-orb">
                      <div className="orb-inner"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'vision' && (
              <div className="vision-content fade-in">
                <div className="vision-grid">
                  <div className="vision-visual">
                    <div className="vision-cubes">
                      <div className="cube cube-1"></div>
                      <div className="cube cube-2"></div>
                      <div className="cube cube-3"></div>
                    </div>
                  </div>
                  <div className="vision-text">
                    <h3>Every Home, Perfectly Maintained</h3>
                    <p>
                      We envision a future where every homeowner has instant access to trusted professionals, 
                      and every skilled professional has the opportunity to build a thriving business. 
                      We're building the largest, most trusted home services ecosystem.
                    </p>
                    <div className="vision-stats">
                      <div className="vision-stat">
                        <span className="stat-value">2025</span>
                        <span className="stat-label">50 Cities</span>
                      </div>
                      <div className="vision-stat">
                        <span className="stat-value">2026</span>
                        <span className="stat-label">100K Pros</span>
                      </div>
                      <div className="vision-stat">
                        <span className="stat-value">2027</span>
                        <span className="stat-label">1M Services</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="values-container">
          <div className="section-header">
            <span className="section-badge">Our Values</span>
            <h2 className="section-title">
              What We <span className="title-accent">Stand For</span>
            </h2>
            <p className="section-description">
              These principles guide everything we do, every day
            </p>
          </div>

          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card" style={{ '--value-color': value.color }}>
                <div className="value-icon-wrapper">
                  <span className="value-icon">{value.icon}</span>
                  <div className="value-glow"></div>
                </div>
                <h3 className="value-title">{value.title}</h3>
                <p className="value-description">{value.description}</p>
                <div className="value-shine"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      

      {/* Stats Section */}
      <section className="about-stats-section" ref={statsRef}>
        <div className="stats-background">
          <div className="stats-pattern"></div>
        </div>

        <div className="stats-container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <span className="stat-number">{counterValues.customers.toLocaleString()}+</span>
                <span className="stat-label">Registered Users</span>
              </div>
              <div className="stat-progress"></div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👨‍🔧</div>
              <div className="stat-content">
                <span className="stat-number">{counterValues.professionals}+</span>
                <span className="stat-label">Expert Professionals</span>
              </div>
              <div className="stat-progress"></div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🛠️</div>
              <div className="stat-content">
                <span className="stat-number">{counterValues.services.toLocaleString()}+</span>
                <span className="stat-label">Services Completed</span>
              </div>
              <div className="stat-progress"></div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🏙️</div>
              <div className="stat-content">
                <span className="stat-number">{counterValues.cities}+</span>
                <span className="stat-label">Cities Covered</span>
              </div>
              <div className="stat-progress"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="team-container">
          <div className="section-header">
            <span className="section-badge">Our Team</span>
            <h2 className="section-title">
              Meet the <span className="title-accent">People</span> Behind KaryON
            </h2>
            <p className="section-description">
              Passionate individuals dedicated to revolutionizing home services
            </p>
          </div>

          <div className="team-grid">
            {teamMembers.map(member => (
              <div 
                key={member.id} 
                className={`team-card ${activeTeamMember === member.id ? 'active' : ''}`}
                onClick={() => setActiveTeamMember(member.id === activeTeamMember ? null : member.id)}
                style={{ '--member-color': member.color }}
              >
                <div className="team-card-inner">
                  <div className="team-card-front">
                    <div className="team-image">
                      <span className="team-avatar">{member.image}</span>
                      <div className="team-image-glow"></div>
                    </div>
                    <h3 className="team-name">{member.name}</h3>
                    <p className="team-role">{member.role}</p>
                    <div className="team-hover-indicator">
                      <span>Click to learn more</span>
                      <span className="indicator-icon">↓</span>
                    </div>
                  </div>
                  
                  <div className="team-card-back">
                    <h3 className="team-name">{member.name}</h3>
                    <p className="team-bio">{member.bio}</p>
                    <div className="team-expertise">
                      <h4>Expertise:</h4>
                      <ul>
                        {member.expertise.map((skill, i) => (
                          <li key={i}>{skill}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="team-social">
                      <a href={member.social.linkedin} className="social-link">in</a>
                      <a href={member.social.twitter} className="social-link">𝕏</a>
                      <a href={member.social.email} className="social-link">✉️</a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="achievements-section">
        <div className="achievements-container">
          <div className="section-header">
            <span className="section-badge">Achievements</span>
            <h2 className="section-title">
              Our <span className="title-accent">Milestones</span> & Recognition
            </h2>
          </div>

          <div className="achievements-grid">
            {achievements.map((achievement, index) => (
              <div key={index} className="achievement-card">
                <div className="achievement-icon">{achievement.icon}</div>
                <h3 className="achievement-title">{achievement.title}</h3>
                <p className="achievement-org">{achievement.organization}</p>
                <div className="achievement-shine"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="about-testimonials">
        <div className="testimonials-container">
          <div className="section-header">
            <span className="section-badge">Testimonials</span>
            <h2 className="section-title">
              What People <span className="title-accent">Say</span> About Us
            </h2>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card" style={{ '--testimonial-color': testimonial.color }}>
                <div className="testimonial-quote">"</div>
                <p className="testimonial-text">{testimonial.content}</p>
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="star">★</span>
                  ))}
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    <span>{testimonial.image}</span>
                  </div>
                  <div className="author-info">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title">
              Be Part of Our <span className="title-accent">Journey</span>
            </h2>
            <p className="cta-description">
              Whether you're a homeowner looking for reliable service or a professional wanting to grow your business, 
              we'd love to have you on board.
            </p>
            <div className="cta-buttons">
              <button className="cta-btn-primary">
                <span>Join as Customer</span>
                <span className="btn-icon">→</span>
              </button>
              <button className="cta-btn-secondary">
                <span>Become a Professional</span>
                <span className="btn-icon">→</span>
              </button>
            </div>
          </div>
          <div className="cta-visual">
            <div className="cta-shapes">
              <div className="shape shape-1"></div>
              <div className="shape shape-2"></div>
              <div className="shape shape-3"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;