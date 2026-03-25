import React, { useState } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import './Signup.css';

const API_URL = 'http://localhost:5001/api/auth';

const Signup = () => {
  const [userType, setUserType] = useState('customer'); // 'customer' or 'professional'
  const [formData, setFormData] = useState({
    // Common fields
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    // Customer specific
    address: '',
    city: '',
    zipCode: '',
    
    // Professional specific
    profession: '',
    experience: '',
    skills: [],
    certifications: '',
    hourlyRate: '',
    bio: '',
    profileImage: null,
    idProof: null,
    
    // Both
    agreeToTerms: false
  });

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isGoogleConfigured =
    Boolean(googleClientId) &&
    !googleClientId.startsWith('your_') &&
    googleClientId.endsWith('.apps.googleusercontent.com');

  const professions = [
    'Plumber',
    'Electrician',
    'Carpenter',
    'Painter',
    'Cleaner',
    'HVAC Technician',
    'Gardener',
    'Moving Specialist',
    'Handyman',
    'Tutor'
  ];

  const skillsList = [
    'Pipe Installation',
    'Leak Repair',
    'Electrical Wiring',
    'Circuit Breaker',
    'Furniture Making',
    'Cabinet Installation',
    'Wall Painting',
    'Deep Cleaning',
    'AC Repair',
    'Heater Installation',
    'Landscaping',
    'Tree Trimming',
    'Packing',
    'Moving',
    'Drywall Repair',
    'Tile Installation',
    'Math',
    'Science',
    'English',
    'Physics',
    'Chemistry'
  ];

  const experienceLevels = [
    '0-1 years',
    '1-3 years',
    '3-5 years',
    '5-10 years',
    '10+ years'
  ];

  const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
  const idProofAllowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const profileImageAllowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else if (type === 'checkbox') {
      if (name === 'skills') {
        const updatedSkills = checked 
          ? [...formData.skills, value]
          : formData.skills.filter(skill => skill !== value);
        setFormData(prev => ({
          ...prev,
          skills: updatedSkills
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      // Password strength check
      if (name === 'password') {
        calculatePasswordStrength(value);
      }
    }
    
    // Clear errors
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleFileChange = (fieldName, e) => {
    const selectedFile = e.target.files?.[0] || null;

    if (!selectedFile) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: null
      }));

      if (formErrors[fieldName]) {
        setFormErrors(prev => ({ ...prev, [fieldName]: '' }));
      }

      setErrorMessage('');
      setSuccessMessage('');
      return;
    }

    const allowedTypes = fieldName === 'idProof' ? idProofAllowedMimeTypes : profileImageAllowedMimeTypes;

    if (!allowedTypes.includes(selectedFile.type)) {
      const invalidTypeMessage = fieldName === 'idProof'
        ? 'Invalid ID proof type. Use PDF, JPG, PNG, or WEBP.'
        : 'Invalid profile image type. Use JPG, PNG, or WEBP.';

      setFormData(prev => ({
        ...prev,
        [fieldName]: null
      }));
      setFormErrors(prev => ({ ...prev, [fieldName]: invalidTypeMessage }));
      e.target.value = '';
      return;
    }

    if (selectedFile.size > MAX_UPLOAD_SIZE_BYTES) {
      const largeFileMessage = fieldName === 'idProof'
        ? 'ID proof file is too large. Maximum size is 5MB.'
        : 'Profile image file is too large. Maximum size is 5MB.';

      setFormData(prev => ({
        ...prev,
        [fieldName]: null
      }));
      setFormErrors(prev => ({ ...prev, [fieldName]: largeFileMessage }));
      e.target.value = '';
      return;
    }

    setFormData(prev => ({
      ...prev,
      [fieldName]: selectedFile
    }));

    if (formErrors[fieldName]) {
      setFormErrors(prev => ({ ...prev, [fieldName]: '' }));
    }

    setErrorMessage('');
    setSuccessMessage('');
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!]+/)) strength++;
    setPasswordStrength(strength);
  };

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 1) {
      if (!formData.fullName) errors.fullName = 'Full name is required';
      if (!formData.email) errors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
      
      if (!formData.password) errors.password = 'Password is required';
      else if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
      
      if (!formData.phone) errors.phone = 'Phone number is required';
      else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        errors.phone = 'Invalid phone number';
      }
    } else if (step === 2) {
      if (userType === 'customer') {
        if (!formData.address) errors.address = 'Address is required';
        if (!formData.city) errors.city = 'City is required';
        if (!formData.zipCode) errors.zipCode = 'Zip code is required';
      } else if (userType === 'professional') {
        if (!formData.profession) errors.profession = 'Profession is required';
        if (!formData.experience) errors.experience = 'Experience is required';
        if (formData.skills.length === 0) errors.skills = 'Select at least one skill';
        if (!formData.hourlyRate) errors.hourlyRate = 'Hourly rate is required';
        if (!formData.bio) errors.bio = 'Bio is required';
      }
    } else if (step === 3) {
      if (userType === 'professional') {
        if (!formData.idProof) errors.idProof = 'ID proof is required';
      }
      if (!formData.agreeToTerms) errors.agreeToTerms = 'You must agree to the terms';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;

    // For step 1, move to next step
    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    // For step 2, move to next step
    if (currentStep === 2) {
      if (userType === 'customer') {
        setCurrentStep(3);
      } else {
        // Professionals need to upload ID in step 3
        setCurrentStep(3);
      }
      return;
    }

    // For step 3, submit the form
    setIsLoading(true);
    setErrorMessage('');

    try {
      let response;

      if (userType === 'professional') {
        const professionalFormData = new FormData();
        professionalFormData.append('name', formData.fullName);
        professionalFormData.append('email', formData.email);
        professionalFormData.append('phone', formData.phone);
        professionalFormData.append('password', formData.password);
        professionalFormData.append('userType', userType);
        professionalFormData.append('profession', formData.profession);
        professionalFormData.append('experience', formData.experience);
        professionalFormData.append('skills', JSON.stringify(formData.skills));
        professionalFormData.append('certifications', formData.certifications || '');
        professionalFormData.append('hourlyRate', formData.hourlyRate);
        professionalFormData.append('bio', formData.bio);

        if (formData.idProof) {
          professionalFormData.append('idProof', formData.idProof);
        }

        if (formData.profileImage) {
          professionalFormData.append('profileImage', formData.profileImage);
        }

        response = await axios.post(`${API_URL}/register`, professionalFormData);
      } else {
        const userData = {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          userType: userType,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode
        };

        response = await axios.post(`${API_URL}/register`, userData);
      }

// Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      setSuccessMessage('Your account has been created successfully! Redirecting...');
      
      // Redirect to home after success
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
      
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse?.credential;

    if (!idToken) {
      setErrorMessage('Google authentication failed. Please try again.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await axios.post(`${API_URL}/google`, { idToken });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      setSuccessMessage('Google signup successful! Redirecting...');
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Google signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrorMessage('Google authentication was canceled or failed. Please try again.');
  };

  return (
    <div className="signup-page">
      {/* Hero Section */}
      <section className="signup-hero">
        <div className="signup-hero-particles">
          {[...Array(15)].map((_, i) => (
            <div key={i} className={`signup-particle particle-${i + 1}`}></div>
          ))}
        </div>
        
        <div className="signup-hero-content">
          <h1 className="signup-hero-title">
            Join <span className="hero-highlight">KaryON</span>
          </h1>
          <p className="signup-hero-description">
            Choose your path and start your journey with us today
          </p>
        </div>
        
        <div className="signup-hero-wave">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,42.7C960,43,1056,53,1152,58.7C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* User Type Selection */}
      <section className="user-type-section">
        <div className="user-type-container">
          <div className="user-type-toggle">
            <button
              className={`user-type-btn ${userType === 'customer' ? 'active' : ''}`}
              onClick={() => setUserType('customer')}
            >
              <span className="type-icon">👤</span>
              <span className="type-text">Customer</span>
              <span className="type-desc">Book services & track orders</span>
            </button>
            <button
              className={`user-type-btn ${userType === 'professional' ? 'active' : ''}`}
              onClick={() => setUserType('professional')}
            >
              <span className="type-icon">👨‍🔧</span>
              <span className="type-text">Professional</span>
              <span className="type-desc">Offer services & earn money</span>
            </button>
          </div>
        </div>
      </section>

      {/* Signup Form */}
      <section className="signup-form-section">
        <div className="signup-form-container">
          {/* Error/Success Messages */}
          {errorMessage && (
            <div className="alert alert-error">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="alert alert-success">
              {successMessage}
            </div>
          )}

          {/* Progress Bar */}
          <div className="form-progress">
            <div className="progress-steps">
              <div className={`step ${currentStep >= 1 ? 'completed' : ''} ${currentStep === 1 ? 'active' : ''}`}>
                <span className="step-number">1</span>
                <span className="step-label">Account</span>
              </div>
              <div className="progress-line"></div>
              <div className={`step ${currentStep >= 2 ? 'completed' : ''} ${currentStep === 2 ? 'active' : ''}`}>
                <span className="step-number">2</span>
                <span className="step-label">Profile</span>
              </div>
              <div className="progress-line"></div>
              <div className={`step ${currentStep >= 3 ? 'completed' : ''} ${currentStep === 3 ? 'active' : ''}`}>
                <span className="step-number">3</span>
                <span className="step-label">Verification</span>
              </div>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(currentStep / 3) * 100}%` }}></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="signup-form">
            {/* Step 1: Account Information */}
            {currentStep === 1 && (
              <div className="form-step fade-in">
                <h2 className="step-title">Create Your Account</h2>
                
                <div className="form-group">
                  <label htmlFor="fullName">
                    <span className="label-icon">👤</span>
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={`form-input ${formErrors.fullName ? 'error' : ''}`}
                  />
                  {formErrors.fullName && <span className="error-message">{formErrors.fullName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    <span className="label-icon">📧</span>
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={`form-input ${formErrors.email ? 'error' : ''}`}
                  />
                  {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">
                    <span className="label-icon">📞</span>
                    Phone Number <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter 10-digit mobile number"
                    className={`form-input ${formErrors.phone ? 'error' : ''}`}
                  />
                  {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="password">
                    <span className="label-icon">🔒</span>
                    Password <span className="required">*</span>
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      className={`form-input ${formErrors.password ? 'error' : ''}`}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {formErrors.password && <span className="error-message">{formErrors.password}</span>}
                  
                  {/* Password Strength Meter */}
                  {formData.password && (
                    <div className="password-strength">
                      <div className="strength-bars">
                        {[1, 2, 3, 4, 5].map((bar) => (
                          <div
                            key={bar}
                            className={`strength-bar ${bar <= passwordStrength ? 'active' : ''}`}
                            style={{
                              backgroundColor: bar <= passwordStrength 
                                ? passwordStrength <= 2 ? '#f44336' 
                                : passwordStrength <= 3 ? '#ff9800'
                                : '#4caf50'
                                : '#e0e0e0'
                            }}
                          ></div>
                        ))}
                      </div>
                      <span className="strength-text">
                        {passwordStrength === 0 && 'Very Weak'}
                        {passwordStrength === 1 && 'Weak'}
                        {passwordStrength === 2 && 'Fair'}
                        {passwordStrength === 3 && 'Good'}
                        {passwordStrength === 4 && 'Strong'}
                        {passwordStrength === 5 && 'Very Strong'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    <span className="label-icon">🔒</span>
                    Confirm Password <span className="required">*</span>
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className={`form-input ${formErrors.confirmPassword ? 'error' : ''}`}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {formErrors.confirmPassword && <span className="error-message">{formErrors.confirmPassword}</span>}
                </div>

                <div className="signup-social">
                  <p className="signup-social-divider">
                    <span>Or continue with</span>
                  </p>
                  {isGoogleConfigured ? (
                    <div className="signup-google-widget" aria-disabled={isLoading}>
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        text="continue_with"
                        size="large"
                        shape="pill"
                        width="340"
                        theme="outline"
                      />
                    </div>
                  ) : (
                    <p className="signup-google-note">Google sign-up is not configured yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Profile Information */}
            {currentStep === 2 && (
              <div className="form-step fade-in">
                <h2 className="step-title">
                  {userType === 'customer' ? 'Your Address' : 'Professional Profile'}
                </h2>

                {userType === 'customer' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="address">
                        <span className="label-icon">🏠</span>
                        Street Address <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter your street address"
                        className={`form-input ${formErrors.address ? 'error' : ''}`}
                      />
                      {formErrors.address && <span className="error-message">{formErrors.address}</span>}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="city">
                          <span className="label-icon">🏙️</span>
                          City <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="City"
                          className={`form-input ${formErrors.city ? 'error' : ''}`}
                        />
                        {formErrors.city && <span className="error-message">{formErrors.city}</span>}
                      </div>

                      <div className="form-group">
                        <label htmlFor="zipCode">
                          <span className="label-icon">📮</span>
                          Zip Code <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          id="zipCode"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          placeholder="Zip code"
                          className={`form-input ${formErrors.zipCode ? 'error' : ''}`}
                        />
                        {formErrors.zipCode && <span className="error-message">{formErrors.zipCode}</span>}
                      </div>
                    </div>
                  </>
                )}

                {userType === 'professional' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="profession">
                        <span className="label-icon">🛠️</span>
                        Profession <span className="required">*</span>
                      </label>
                      <select
                        id="profession"
                        name="profession"
                        value={formData.profession}
                        onChange={handleChange}
                        className={`form-select ${formErrors.profession ? 'error' : ''}`}
                      >
                        <option value="">Select your profession</option>
                        {professions.map(prof => (
                          <option key={prof} value={prof}>{prof}</option>
                        ))}
                      </select>
                      {formErrors.profession && <span className="error-message">{formErrors.profession}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="experience">
                        <span className="label-icon">⏳</span>
                        Years of Experience <span className="required">*</span>
                      </label>
                      <select
                        id="experience"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        className={`form-select ${formErrors.experience ? 'error' : ''}`}
                      >
                        <option value="">Select experience</option>
                        {experienceLevels.map(exp => (
                          <option key={exp} value={exp}>{exp}</option>
                        ))}
                      </select>
                      {formErrors.experience && <span className="error-message">{formErrors.experience}</span>}
                    </div>

                    <div className="form-group">
                      <label>
                        <span className="label-icon">🔧</span>
                        Skills <span className="required">*</span>
                      </label>
                      <div className="skills-grid">
                        {skillsList.map(skill => (
                          <label key={skill} className="skill-checkbox">
                            <input
                              type="checkbox"
                              name="skills"
                              value={skill}
                              checked={formData.skills.includes(skill)}
                              onChange={handleChange}
                            />
                            <span className="skill-name">{skill}</span>
                          </label>
                        ))}
                      </div>
                      {formErrors.skills && <span className="error-message">{formErrors.skills}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="hourlyRate">
                        <span className="label-icon">💰</span>
                        Hourly Rate (₹) <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        id="hourlyRate"
                        name="hourlyRate"
                        value={formData.hourlyRate}
                        onChange={handleChange}
                        placeholder="e.g., 500"
                        min="10"
                        className={`form-input ${formErrors.hourlyRate ? 'error' : ''}`}
                      />
                      {formErrors.hourlyRate && <span className="error-message">{formErrors.hourlyRate}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="bio">
                        <span className="label-icon">📝</span>
                        Professional Bio <span className="required">*</span>
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Tell us about yourself and your experience..."
                        rows="4"
                        className={`form-textarea ${formErrors.bio ? 'error' : ''}`}
                      ></textarea>
                      {formErrors.bio && <span className="error-message">{formErrors.bio}</span>}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Verification */}
            {currentStep === 3 && (
              <div className="form-step fade-in">
                <h2 className="step-title">Verification</h2>

                {userType === 'professional' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="certifications">
                        <span className="label-icon">📜</span>
                        Certifications (Optional)
                      </label>
                      <input
                        type="text"
                        id="certifications"
                        name="certifications"
                        value={formData.certifications}
                        onChange={handleChange}
                        placeholder="e.g., Licensed Electrician, OSHA Certified"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="idProof">
                        <span className="label-icon">🪪</span>
                        ID Proof <span className="required">*</span>
                      </label>
                      <div className="file-upload">
                        <input
                          type="file"
                          id="idProof"
                          name="idProof"
                          onChange={(e) => handleFileChange('idProof', e)}
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          className="file-input"
                        />
                        <label className="file-upload-label" htmlFor="idProof">
                          <span className="upload-icon">📎</span>
                          <span className="upload-text">
                            {formData.idProof ? formData.idProof.name : 'Upload ID (Driver\'s License, Passport, etc.)'}
                          </span>
                        </label>
                      </div>
                      <small className="field-hint">Allowed: PDF, JPG, PNG, WEBP (max 5MB)</small>
                      {formErrors.idProof && <span className="error-message">{formErrors.idProof}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="profileImage">
                        <span className="label-icon">🖼️</span>
                        Profile Picture (Optional)
                      </label>
                      <div className="file-upload">
                        <input
                          type="file"
                          id="profileImage"
                          name="profileImage"
                          onChange={(e) => handleFileChange('profileImage', e)}
                          accept=".jpg,.jpeg,.png,.webp"
                          className="file-input"
                        />
                        <label className="file-upload-label" htmlFor="profileImage">
                          <span className="upload-icon">📷</span>
                          <span className="upload-text">
                            {formData.profileImage ? formData.profileImage.name : 'Upload profile picture'}
                          </span>
                        </label>
                      </div>
                      <small className="field-hint">Allowed: JPG, PNG, WEBP (max 5MB)</small>
                      {formErrors.profileImage && <span className="error-message">{formErrors.profileImage}</span>}
                    </div>
                  </>
                )}

                <div className="form-group terms-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                    />
                    <span className="checkbox-text">
                      I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
                      <span className="required">*</span>
                    </span>
                  </label>
                  {formErrors.agreeToTerms && <span className="error-message">{formErrors.agreeToTerms}</span>}
                </div>

                <div className="verification-note">
                  <span className="note-icon">🔒</span>
                  <p>Your information is secure and will never be shared with third parties.</p>
                </div>
              </div>
            )}

            {/* Form Navigation Buttons */}
            <div className="form-navigation">
              {currentStep > 1 && (
                <button type="button" className="nav-btn prev" onClick={prevStep}>
                  <span className="btn-icon">←</span>
                  Previous
                </button>
              )}
              
              {currentStep < 3 ? (
                <button type="button" className="nav-btn next" onClick={nextStep}>
                  Next
                  <span className="btn-icon">→</span>
                </button>
              ) : (
                <button type="submit" className={`nav-btn submit ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
                  {isLoading ? (
                    <span className="loader"></span>
                  ) : (
                    <>
                      Create Account
                      <span className="btn-icon">✓</span>
                    </>
                  )}
                  <div className="btn-shine"></div>
                </button>
              )}
            </div>
          </form>

          {/* Login Link */}
          <div className="login-link">
            <p>Already have an account? <a href="/login">Log in</a></p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="benefits-container">
          <div className="benefits-header">
            <h2 className="benefits-title">
              Why Join <span className="title-accent">KaryON</span>
            </h2>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon-wrapper">
                <span className="benefit-icon">✅</span>
                <div className="benefit-icon-glow"></div>
              </div>
              <h3 className="benefit-title">Verified Opportunities</h3>
              <p className="benefit-description">Access to thousands of verified service requests</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon-wrapper">
                <span className="benefit-icon">💰</span>
                <div className="benefit-icon-glow"></div>
              </div>
              <h3 className="benefit-title">Secure Payments</h3>
              <p className="benefit-description">Guaranteed payments with our secure system</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon-wrapper">
                <span className="benefit-icon">⭐</span>
                <div className="benefit-icon-glow"></div>
              </div>
              <h3 className="benefit-title">Build Reputation</h3>
              <p className="benefit-description">Grow your business with customer reviews</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon-wrapper">
                <span className="benefit-icon">🛡️</span>
                <div className="benefit-icon-glow"></div>
              </div>
              <h3 className="benefit-title">Insurance Cover</h3>
              <p className="benefit-description">Work with peace of mind with our insurance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="signup-testimonials">
        <div className="testimonials-container">
          <div className="testimonial-card">
            <div className="testimonial-content">
              <span className="testimonial-quote">"</span>
              <p className="testimonial-text">
                Joining as a professional was the best decision. I've grown my client base and earnings significantly.
              </p>
              <div className="testimonial-author">
                <span className="author-avatar">👨‍🔧</span>
                <div className="author-info">
                  <h4>Mike Johnson</h4>
                  <p>Professional Plumber • 2 years with us</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Signup;
