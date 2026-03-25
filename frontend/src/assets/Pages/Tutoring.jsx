// tutoring.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../../api';
import './Tutoring.css';

const Tutoring = () => {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeSubject, setActiveSubject] = useState('all');
  const [activeGrade, setActiveGrade] = useState('all');
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const [counterValues, setCounterValues] = useState({
    tutors: 0,
    students: 0,
    hours: 0,
    subjects: 0,
    cities: 0
  });
  
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    grade: '',
    sessionType: '',
    preferredDate: '',
    preferredTime: '',
    address: '',
    learningGoals: '',
    tutorPreference: ''
  });

  const statsRef = useRef(null);
  const parallaxRef = useRef(null);

  // Counter Animation
  useEffect(() => {
    const targets = {
      tutors: 500,
      students: 10000,
      hours: 50000,
      subjects: 30,
      cities: 50
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

  // Subjects Data
  const subjects = [
    { id: 'mathematics', name: 'Mathematics', icon: '📐', color: '#667eea', levels: ['Elementary', 'Middle School', 'High School', 'College'] },
    { id: 'science', name: 'Science', icon: '🔬', color: '#fc7f03', levels: ['Elementary', 'Middle School', 'High School', 'College'] },
    { id: 'english', name: 'English', icon: '📚', color: '#502222', levels: ['Elementary', 'Middle School', 'High School', 'College'] },
    { id: 'history', name: 'History', icon: '🏛️', color: '#667eea', levels: ['Middle School', 'High School', 'College'] },
    { id: 'languages', name: 'Languages', icon: '🌐', color: '#fc7f03', levels: ['All Levels'] },
    { id: 'computer-science', name: 'Computer Science', icon: '💻', color: '#502222', levels: ['High School', 'College'] },
    { id: 'test-prep', name: 'Test Prep', icon: '📝', color: '#667eea', levels: ['SAT', 'ACT', 'GRE', 'GMAT'] },
    { id: 'music', name: 'Music', icon: '🎵', color: '#fc7f03', levels: ['All Levels'] },
    { id: 'art', name: 'Art', icon: '🎨', color: '#502222', levels: ['All Levels'] }
  ];

  // Grade Levels
  const gradeLevels = [
    { value: 'elementary', label: 'Elementary School (K-5)' },
    { value: 'middle', label: 'Middle School (6-8)' },
    { value: 'high', label: 'High School (9-12)' },
    { value: 'college', label: 'College/University' },
    { value: 'adult', label: 'Adult Learning' }
  ];

  // Session Types
  const sessionTypes = [
    { value: 'online', label: 'Online Tutoring', icon: '💻' },
    { value: 'in-home', label: 'In-Home Tutoring', icon: '🏠' },
    { value: 'library', label: 'Library/Public Place', icon: '📖' },
    { value: 'group', label: 'Group Sessions', icon: '👥' }
  ];

  // Featured Tutors
  const featuredTutors = [
    {
      id: 1,
      name: "Dr. Sarah Chen",
      subjects: ["Mathematics", "Physics"],
      expertise: ["Calculus", "AP Physics", "Test Prep"],
      experience: "12 years",
      education: "Ph.D. in Applied Mathematics",
      rating: 4.9,
      students: 500,
      image: "👩‍🏫",
      bio: "Passionate about making math accessible and fun. Specializes in advanced mathematics and test preparation.",
      availability: "Weekdays & Weekends",
      color: "#667eea"
    },
    {
      id: 2,
      name: "Prof. Michael Roberts",
      subjects: ["English", "History"],
      expertise: ["Essay Writing", "Literature", "SAT Verbal"],
      experience: "15 years",
      education: "M.A. in English Literature",
      rating: 5.0,
      students: 800,
      image: "👨‍🏫",
      bio: "Former university professor helping students excel in writing and critical thinking.",
      availability: "Evenings & Weekends",
      color: "#fc7f03"
    },
    {
      id: 3,
      name: "Dr. Emily Martinez",
      subjects: ["Science", "Chemistry", "Biology"],
      expertise: ["AP Sciences", "Lab Work", "Medical Prep"],
      experience: "10 years",
      education: "Ph.D. in Molecular Biology",
      rating: 4.8,
      students: 450,
      image: "👩‍🔬",
      bio: "Making science exciting through hands-on learning and real-world applications.",
      availability: "Flexible Hours",
      color: "#502222"
    },
    {
      id: 4,
      name: "David Kim",
      subjects: ["Computer Science", "Mathematics"],
      expertise: ["Programming", "Algorithms", "Web Development"],
      experience: "8 years",
      education: "M.S. in Computer Science",
      rating: 4.9,
      students: 300,
      image: "👨‍💻",
      bio: "Tech industry professional teaching coding and problem-solving skills.",
      availability: "Weekends Only",
      color: "#667eea"
    },
    {
      id: 5,
      name: "Maria Garcia",
      subjects: ["Languages", "ESL"],
      expertise: ["Spanish", "French", "ESL"],
      experience: "14 years",
      education: "M.A. in Linguistics",
      rating: 5.0,
      students: 600,
      image: "👩‍🏫",
      bio: "Multilingual instructor specializing in language acquisition and cultural studies.",
      availability: "Mornings & Afternoons",
      color: "#fc7f03"
    },
    {
      id: 6,
      name: "Prof. James Wilson",
      subjects: ["History", "Political Science"],
      expertise: ["World History", "Government", "Essay Writing"],
      experience: "20 years",
      education: "Ph.D. in History",
      rating: 4.9,
      students: 1000,
      image: "👨‍🎓",
      bio: "Award-winning educator making history come alive for students.",
      availability: "Evenings Only",
      color: "#502222"
    }
  ];

  // Success Stories
  const successStories = [
    {
      name: "Alex Thompson",
      achievement: "SAT Score: +400 points",
      subject: "Test Prep",
      quote: "Thanks to Dr. Chen, I got into my dream university! The personalized approach made all the difference.",
      image: "👨‍🎓",
      rating: 5,
      color: "#667eea"
    },
    {
      name: "Jessica Lee",
      achievement: "Grade A in Calculus",
      subject: "Mathematics",
      quote: "I went from failing to top of my class. The tutors are patient and really know their stuff.",
      image: "👩‍🎓",
      rating: 5,
      color: "#fc7f03"
    },
    {
      name: "Marcus Brown",
      achievement: "First in Family to Graduate",
      subject: "All Subjects",
      quote: "The support I received was incredible. They believed in me when I didn't believe in myself.",
      image: "👨‍🎓",
      rating: 5,
      color: "#502222"
    }
  ];

  // Testimonials
  const testimonials = [
    {
      name: "Robert Johnson",
      role: "Parent",
      content: "My daughter's confidence in math has completely transformed. The tutors are patient, knowledgeable, and truly care.",
      rating: 5,
      image: "👨",
      color: "#667eea"
    },
    {
      name: "Patricia Lee",
      role: "College Student",
      content: "The flexible scheduling and online options saved my semester. Best tutoring service I've ever used.",
      rating: 5,
      image: "👩",
      color: "#fc7f03"
    },
    {
      name: "Dr. Williams",
      role: "School Counselor",
      content: "I recommend KaryON Tutoring to all my students. Their tutors are highly qualified and dedicated.",
      rating: 5,
      image: "👩‍⚕️",
      color: "#502222"
    }
  ];

  // FAQs
  const faqs = [
    {
      q: "How are tutors selected?",
      a: "All tutors undergo rigorous screening, background checks, and demonstrate proven expertise in their subjects."
    },
    {
      q: "Can I switch tutors if needed?",
      a: "Absolutely! We want the perfect match. You can request a new tutor anytime at no additional cost."
    },
    {
      q: "What's your cancellation policy?",
      a: "Free cancellation up to 24 hours before the session. Late cancellations may incur a small fee."
    },
    {
      q: "Do you offer online tutoring?",
      a: "Yes! We offer both online and in-person tutoring with our interactive virtual classroom platform."
    },
    {
      q: "How do you track progress?",
      a: "Regular progress reports, milestone tracking, and parent-teacher conferences are included with all packages."
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
      const subjectLabel = subjects.find(subject => subject.id === bookingForm.subject)?.name || 'General Tutoring';
      const gradeLabel = gradeLevels.find(level => level.value === bookingForm.grade)?.label || bookingForm.grade;

      const bookingData = {
        customer: {
          name: bookingForm.name,
          email: bookingForm.email,
          phone: bookingForm.phone
        },
        service: {
          type: 'Tutoring',
          name: `${subjectLabel} Tutoring`,
          description: bookingForm.learningGoals || `${subjectLabel} session for ${gradeLabel}`,
          subService: bookingForm.subject
        },
        schedule: {
          date: bookingForm.preferredDate,
          time: bookingForm.preferredTime,
          isEmergency: false
        },
        address: {
          street: bookingForm.sessionType === 'online' ? 'Online session' : (bookingForm.address || 'To be confirmed'),
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
            name: '', email: '', phone: '', subject: '', grade: '', sessionType: '',
            preferredDate: '', preferredTime: '', address: '', learningGoals: '', tutorPreference: ''
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

  const filteredTutors = featuredTutors.filter(tutor => {
    if (activeSubject === 'all' && activeGrade === 'all') return true;
    if (activeSubject !== 'all' && !tutor.subjects.includes(subjects.find(s => s.id === activeSubject)?.name)) return false;
    return true;
  });

  return (
    <div className="tutoring">
      {/* Hero Section with Parallax */}
      <section className="tutoring-hero">
        <div className="tutoring-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`tutoring-particle particle-${i + 1}`}></div>
          ))}
        </div>
        
        <div className="tutoring-hero-background" ref={parallaxRef}>
          <div className="tutoring-hero-gradient"></div>
          <div className="tutoring-hero-pattern"></div>
        </div>

        <div className="tutoring-hero-container">
          <div className="tutoring-hero-content">
            <div className="tutoring-hero-badge">
              <span className="badge-pulse"></span>
              <span className="badge-text">Expert Tutors • Personalized Learning • All Subjects</span>
            </div>
            
            <h1 className="tutoring-hero-title">
              <span className="title-line">Unlock Your</span>
              <span className="title-highlight">Learning Potential</span>
            </h1>
            
            <p className="tutoring-hero-description">
              Connect with expert tutors who make learning engaging and effective. 
              From elementary to college level, we're here to help you succeed.
            </p>

            <div className="tutoring-hero-cta">
              <button 
                className="cta-btn-primary"
                onClick={() => setShowBookingForm(true)}
              >
                <span>Find a Tutor</span>
                <span className="btn-icon">→</span>
                <div className="btn-shine"></div>
              </button>
              
              <button className="cta-btn-secondary">
                <span className="btn-play-icon">📚</span>
                <span>Free Assessment</span>
              </button>
            </div>

            <div className="tutoring-hero-stats">
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Expert Tutors</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">4.9★</span>
                <span className="stat-label">Avg Rating</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Support</span>
              </div>
            </div>
          </div>

          <div className="tutoring-hero-visual">
            <div className="tutoring-floating-card card-1">
              <span className="card-icon">📚</span>
              <div className="card-text">
                <strong>1-on-1 Learning</strong>
                <span>Personalized attention</span>
              </div>
            </div>
            <div className="tutoring-floating-card card-2">
              <span className="card-icon">⭐</span>
              <div className="card-text">
                <strong>Top Tutors</strong>
                <span>Verified experts</span>
              </div>
            </div>
            <div className="tutoring-floating-card card-3">
              <span className="card-icon">💻</span>
              <div className="card-text">
                <strong>Online & In-Person</strong>
                <span>Flexible options</span>
              </div>
            </div>
            
            <div className="tutoring-hero-image-wrapper">
              <div className="tutoring-hero-image-glow"></div>
              <div className="tutoring-hero-image">
                <div className="tutoring-hero-image-content">
                  <span className="main-emoji">📚</span>
                  <span className="learning-symbol-1">✏️</span>
                  <span className="learning-symbol-2">📝</span>
                  <span className="learning-symbol-3">🎓</span>
                  <span className="learning-symbol-4">💡</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="tutoring-hero-wave">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,42.7C960,43,1056,53,1152,58.7C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="tutoring-subjects">
        <div className="tutoring-subjects-container">
          <div className="section-header">
            <span className="section-subtitle">What We Teach</span>
            <h2 className="section-title">
              Explore Our <span className="title-accent">Subjects</span>
            </h2>
            <p className="section-description">
              From core academics to specialized skills, find the perfect tutor for your needs
            </p>
          </div>

          <div className="subjects-grid">
            {subjects.map((subject, index) => (
              <div key={index} className="subject-card" style={{ '--subject-color': subject.color }}>
                <div className="subject-icon-wrapper">
                  <span className="subject-icon">{subject.icon}</span>
                  <div className="icon-glow"></div>
                </div>
                <h3 className="subject-title">{subject.name}</h3>
                <div className="subject-levels">
                  {subject.levels.slice(0, 3).map((level, idx) => (
                    <span key={idx} className="level-badge">{level}</span>
                  ))}
                  {subject.levels.length > 3 && <span className="level-badge more">+{subject.levels.length - 3}</span>}
                </div>
                <button 
                  className="subject-explore"
                  onClick={() => {
                    setActiveSubject(subject.id);
                    setShowBookingForm(true);
                  }}
                >
                  Find Tutor →
                </button>
                <div className="subject-shine"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="tutoring-how-it-works">
        <div className="tutoring-works-container">
          <div className="section-header light">
            <span className="section-subtitle">Simple Process</span>
            <h2 className="section-title">
              How It <span className="title-accent">Works</span>
            </h2>
          </div>

          <div className="works-steps">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">🔍</div>
              <h3>Find Your Tutor</h3>
              <p>Browse qualified tutors by subject, level, and availability</p>
              <div className="step-glow"></div>
            </div>

            <div className="step-connector">
              <span className="connector-dot"></span>
              <span className="connector-dot"></span>
              <span className="connector-dot"></span>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">📅</div>
              <h3>Book a Session</h3>
              <p>Choose your preferred time and learning format</p>
              <div className="step-glow"></div>
            </div>

            <div className="step-connector">
              <span className="connector-dot"></span>
              <span className="connector-dot"></span>
              <span className="connector-dot"></span>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">📚</div>
              <h3>Start Learning</h3>
              <p>Connect with your tutor and begin your learning journey</p>
              <div className="step-glow"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tutors */}
      <section className="featured-tutors">
        <div className="tutors-container">
          <div className="section-header">
            <span className="section-subtitle">Our Experts</span>
            <h2 className="section-title">
              Featured <span className="title-accent">Tutors</span>
            </h2>
            <p className="section-description">
              Learn from the best - all tutors are verified and highly qualified
            </p>
          </div>

          <div className="tutors-filters">
            <select 
              className="filter-select"
              value={activeSubject}
              onChange={(e) => setActiveSubject(e.target.value)}
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>

            <select 
              className="filter-select"
              value={activeGrade}
              onChange={(e) => setActiveGrade(e.target.value)}
            >
              <option value="all">All Levels</option>
              {gradeLevels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>

          <div className="tutors-grid">
            {filteredTutors.map(tutor => (
              <div 
                key={tutor.id} 
                className="tutor-card"
                onClick={() => setSelectedTutor(tutor)}
                style={{ '--tutor-color': tutor.color }}
              >
                <div className="tutor-image">
                  <span className="tutor-avatar">{tutor.image}</span>
                  <div className="tutor-rating-badge">
                    <span className="rating-star">★</span>
                    <span>{tutor.rating}</span>
                  </div>
                </div>
                <h3 className="tutor-name">{tutor.name}</h3>
                <p className="tutor-subjects">{tutor.subjects.join(' • ')}</p>
                <div className="tutor-stats">
                  <div className="tutor-stat">
                    <span className="stat-icon">🎓</span>
                    <span>{tutor.experience}</span>
                  </div>
                  <div className="tutor-stat">
                    <span className="stat-icon">👥</span>
                    <span>{tutor.students}+ students</span>
                  </div>
                </div>
                <div className="tutor-expertise">
                  {tutor.expertise.slice(0, 3).map((skill, i) => (
                    <span key={i} className="expertise-tag">{skill}</span>
                  ))}
                </div>
                <button className="tutor-select-btn">
                  View Profile →
                </button>
              </div>
            ))}
          </div>

          <div className="tutors-cta">
            <button className="view-all-btn">
              View All Tutors
              <span className="btn-icon">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="tutoring-stats" ref={statsRef}>
        <div className="tutoring-stats-background">
          <div className="tutoring-stats-pattern"></div>
        </div>

        <div className="tutoring-stats-container">
          <div className="tutoring-stats-grid">
            <div className="stats-card">
              <div className="stats-icon">👨‍🏫</div>
              <div className="stats-content">
                <span className="stats-number">{counterValues.tutors}+</span>
                <span className="stats-label">Expert Tutors</span>
              </div>
              <div className="stats-progress"></div>
            </div>

            <div className="stats-card">
              <div className="stats-icon">👥</div>
              <div className="stats-content">
                <span className="stats-number">{counterValues.students.toLocaleString()}+</span>
                <span className="stats-label">Happy Students</span>
              </div>
              <div className="stats-progress"></div>
            </div>

            <div className="stats-card">
              <div className="stats-icon">⏰</div>
              <div className="stats-content">
                <span className="stats-number">{counterValues.hours.toLocaleString()}+</span>
                <span className="stats-label">Hours Taught</span>
              </div>
              <div className="stats-progress"></div>
            </div>

            <div className="stats-card">
              <div className="stats-icon">📚</div>
              <div className="stats-content">
                <span className="stats-number">{counterValues.subjects}+</span>
                <span className="stats-label">Subjects</span>
              </div>
              <div className="stats-progress"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Session Types */}
      <section className="session-types">
        <div className="session-types-container">
          <div className="section-header">
            <span className="section-subtitle">Flexible Learning</span>
            <h2 className="section-title">
              Choose Your <span className="title-accent">Session Type</span>
            </h2>
          </div>

          <div className="session-types-grid">
            {sessionTypes.map((type, index) => (
              <div key={index} className="session-type-card">
                <div className="session-icon">{type.icon}</div>
                <h3>{type.label}</h3>
                <p>Perfect for students who prefer {type.value === 'online' ? 'virtual learning' : 
                  type.value === 'in-home' ? 'learning at home' :
                  type.value === 'library' ? 'neutral study spaces' : 'collaborative learning'}</p>
                <button 
                  className="session-select"
                  onClick={() => {
                    setBookingForm(prev => ({ ...prev, sessionType: type.value }));
                    setShowBookingForm(true);
                  }}
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="success-stories">
        <div className="stories-container">
          <div className="section-header light">
            <span className="section-subtitle">Real Results</span>
            <h2 className="section-title">
              Success <span className="title-accent">Stories</span>
            </h2>
          </div>

          <div className="stories-grid">
            {successStories.map((story, index) => (
              <div key={index} className="story-card" style={{ '--story-color': story.color }}>
                <div className="story-achievement">{story.achievement}</div>
                <p className="story-quote">"{story.quote}"</p>
                <div className="story-footer">
                  <div className="story-author">
                    <span className="story-avatar">{story.image}</span>
                    <div>
                      <h4>{story.name}</h4>
                      <p>{story.subject}</p>
                    </div>
                  </div>
                  <div className="story-rating">
                    {[...Array(story.rating)].map((_, i) => (
                      <span key={i} className="star">★</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="tutoring-testimonials">
        <div className="tutoring-testimonials-container">
          <div className="section-header">
            <span className="section-subtitle">Testimonials</span>
            <h2 className="section-title">
              What People <span className="title-accent">Say</span>
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
      <section className="tutoring-faq">
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

      {/* Tutor Profile Modal */}
      {selectedTutor && (
        <div className="tutor-modal-overlay" onClick={() => setSelectedTutor(null)}>
          <div className="tutor-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedTutor(null)}>×</button>
            
            <div className="tutor-modal-content">
              <div className="tutor-modal-header">
                <div className="tutor-modal-avatar">
                  <span>{selectedTutor.image}</span>
                </div>
                <div>
                  <h2>{selectedTutor.name}</h2>
                  <p className="tutor-modal-education">{selectedTutor.education}</p>
                </div>
              </div>

              <div className="tutor-modal-body">
                <div className="tutor-modal-section">
                  <h3>About</h3>
                  <p>{selectedTutor.bio}</p>
                </div>

                <div className="tutor-modal-section">
                  <h3>Expertise</h3>
                  <div className="tutor-modal-tags">
                    {selectedTutor.expertise.map((skill, i) => (
                      <span key={i} className="expertise-tag">{skill}</span>
                    ))}
                  </div>
                </div>

                <div className="tutor-modal-stats">
                  <div className="modal-stat">
                    <span className="stat-label">Experience</span>
                    <span className="stat-value">{selectedTutor.experience}</span>
                  </div>
                  <div className="modal-stat">
                    <span className="stat-label">Students</span>
                    <span className="stat-value">{selectedTutor.students}+</span>
                  </div>
                  <div className="modal-stat">
                    <span className="stat-label">Rating</span>
                    <span className="stat-value">{selectedTutor.rating}★</span>
                  </div>
                </div>

                <div className="tutor-modal-section">
                  <h3>Availability</h3>
                  <p>{selectedTutor.availability}</p>
                </div>
              </div>

              <div className="tutor-modal-footer">
                <button 
                  className="book-tutor-btn"
                  onClick={() => {
                    setSelectedTutor(null);
                    setShowBookingForm(true);
                    setBookingForm(prev => ({ 
                      ...prev, 
                      tutorPreference: selectedTutor.name 
                    }));
                  }}
                >
                  Book {selectedTutor.name}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingForm && (
        <div className="booking-modal-overlay" onClick={() => setShowBookingForm(false)}>
          <div className="booking-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowBookingForm(false)}>×</button>
            
            <div className="modal-header">
              <h2>Book a Tutoring Session</h2>
              <p>Tell us about your learning needs and we'll find the perfect tutor</p>
            </div>

            <div className="booking-progress">
              <div className={`progress-step ${formStep >= 1 ? 'active' : ''}`}>
                <span className="step-num">1</span>
                <span className="step-label">Subject</span>
              </div>
              <div className={`progress-step ${formStep >= 2 ? 'active' : ''}`}>
                <span className="step-num">2</span>
                <span className="step-label">Schedule</span>
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
                    <label>Subject *</label>
                    <select
                      name="subject"
                      value={bookingForm.subject}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select subject</option>
                      {subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>{subject.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Grade Level *</label>
                    <select
                      name="grade"
                      value={bookingForm.grade}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select grade level</option>
                      {gradeLevels.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Session Type *</label>
                    <select
                      name="sessionType"
                      value={bookingForm.sessionType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select session type</option>
                      {sessionTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Learning Goals</label>
                    <textarea
                      name="learningGoals"
                      value={bookingForm.learningGoals}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="What do you want to achieve? (e.g., improve grades, test prep, homework help)"
                    ></textarea>
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
                        name="preferredDate"
                        value={bookingForm.preferredDate}
                        onChange={handleInputChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="form-group">
                      <label>Preferred Time *</label>
                      <select
                        name="preferredTime"
                        value={bookingForm.preferredTime}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select time</option>
                        <option value="morning">Morning (8AM - 12PM)</option>
                        <option value="afternoon">Afternoon (12PM - 4PM)</option>
                        <option value="evening">Evening (4PM - 8PM)</option>
                        <option value="night">Night (8PM - 11PM)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Tutor Preference (Optional)</label>
                    <input
                      type="text"
                      name="tutorPreference"
                      value={bookingForm.tutorPreference}
                      onChange={handleInputChange}
                      placeholder="Any specific tutor or preference?"
                    />
                  </div>

                  <div className="form-group">
                    <label>Additional Notes</label>
                    <textarea
                      name="additionalNotes"
                      value={bookingForm.additionalNotes}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Any special requirements or details..."
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
                      <label>Address (for in-person) *</label>
                      <input
                        type="text"
                        name="address"
                        value={bookingForm.address}
                        onChange={handleInputChange}
                        placeholder="Street address, city, zip"
                      />
                    </div>
                  </div>

                  <div className="booking-summary">
                    <h3>Booking Summary</h3>
                    <div className="summary-item">
                      <span>Subject:</span>
                      <strong>{subjects.find(s => s.id === bookingForm.subject)?.name || 'Not selected'}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Grade:</span>
                      <strong>{gradeLevels.find(g => g.value === bookingForm.grade)?.label || 'Not selected'}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Session Type:</span>
                      <strong>{sessionTypes.find(s => s.value === bookingForm.sessionType)?.label || 'Not selected'}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Date:</span>
                      <strong>{bookingForm.preferredDate || 'Not selected'}</strong>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn-prev" onClick={prevStep}>
                      ← Edit
                    </button>
                    <button type="submit" className="btn-submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Book Session →'}
                    </button>
                  </div>
                  {submitError && <p style={{ color: '#c62828', marginTop: '12px' }}>{submitError}</p>}
                  {submitSuccess && <p style={{ color: '#2e7d32', marginTop: '12px' }}>Booking created successfully. Redirecting...</p>}
                </div>
              )}
            </form>

            <div className="modal-footer">
              <span className="secure-badge">🔒 100% Satisfaction Guarantee</span>
              <span className="guarantee-badge">✓ Free Assessment Included</span>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="tutoring-cta">
        <div className="tutoring-cta-background">
          <div className="cta-bubble bubble-1"></div>
          <div className="cta-bubble bubble-2"></div>
          <div className="cta-bubble bubble-3"></div>
        </div>

        <div className="tutoring-cta-container">
          <div className="tutoring-cta-content">
            <h2 className="tutoring-cta-title">
              Ready to Excel in Your Studies?
            </h2>
            <p className="tutoring-cta-description">
              Join thousands of successful students. Get matched with the perfect tutor today.
            </p>

            <div className="tutoring-cta-buttons">
              <button 
                className="cta-primary"
                onClick={() => setShowBookingForm(true)}
              >
                <span>Get Started Now</span>
                <span className="cta-icon">→</span>
                <div className="cta-shine"></div>
              </button>

              <button className="cta-secondary">
                <span className="phone-icon">📞</span>
                <span>Call: (930) 57-24440</span>
              </button>
            </div>

            <div className="tutoring-cta-features">
              <span>✓ Free Trial Session</span>
              <span>✓ Qualified Tutors</span>
              <span>✓ Flexible Scheduling</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Tutoring;