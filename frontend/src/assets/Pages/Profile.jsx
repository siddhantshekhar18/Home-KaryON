import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

const API_URL = 'http://localhost:5001/api/auth';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      zipCode: ''
    },
    profession: '',
    experience: '',
    skills: [],
    hourlyRate: '',
    bio: ''
  });
  const [originalData, setOriginalData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map((namePart) => namePart[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setProfileImagePreview(parsedUser.profileImage || null);
      const newFormData = {
        name: parsedUser.name || '',
        email: parsedUser.email || '',
        phone: parsedUser.phone || '',
        address: parsedUser.address || { street: '', city: '', zipCode: '' },
        profession: parsedUser.profession || '',
        experience: parsedUser.experience || '',
        skills: parsedUser.skills || [],
        hourlyRate: parsedUser.hourlyRate || '',
        bio: parsedUser.bio || ''
      };
      setFormData(newFormData);
      setOriginalData(JSON.parse(JSON.stringify(newFormData)));
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const isChanged = JSON.stringify(formData) !== JSON.stringify(originalData) || profileImageFile;
    setHasChanges(isChanged);
  }, [formData, originalData, profileImageFile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name.startsWith('address.')) {
        const addressField = name.split('.')[1];
        return {
          ...prev,
          address: {
            ...prev.address,
            [addressField]: value
          }
        };
      }
      return {
        ...prev,
        [name]: value
      };
    });
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be less than 5MB', 'error');
        return;
      }
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        showToast('Only JPG, PNG, or WEBP images are allowed', 'error');
        return;
      }
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      showToast('Image selected successfully. Click Save to update.', 'success');
    }
  };

  const triggerImageUpload = () => {
    document.getElementById('profileImageInput')?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasChanges) return;

    setIsSaving(true);

    try {
      const token = localStorage.getItem('token');
      
      // If profile image was changed, upload it as FormData
      if (profileImageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('profileImage', profileImageFile);
        uploadFormData.append('name', formData.name);
        uploadFormData.append('phone', formData.phone);
        uploadFormData.append('address', JSON.stringify(formData.address));
        if (formData.profession) uploadFormData.append('profession', formData.profession);
        if (formData.experience) uploadFormData.append('experience', formData.experience);
        if (formData.skills) uploadFormData.append('skills', JSON.stringify(formData.skills));
        if (formData.hourlyRate) uploadFormData.append('hourlyRate', formData.hourlyRate);
        if (formData.bio) uploadFormData.append('bio', formData.bio);
        
        console.log('Sending profile update with image');
        const response = await axios.put(`${API_URL}/profile`, uploadFormData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Profile update response:', response.data);
        
        localStorage.setItem('user', JSON.stringify(response.data));
        setUser(response.data);
        setFormData(response.data);
        setOriginalData(JSON.parse(JSON.stringify(response.data)));
        setProfileImageFile(null);
        setProfileImagePreview(response.data.profileImage);
        // Dispatch custom event for Navbar and other components to update
        window.dispatchEvent(new Event('profileUpdated'));
        showToast('Profile updated successfully!', 'success');
      } else {
        // No image change, just update data
        const response = await axios.put(`${API_URL}/profile`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        localStorage.setItem('user', JSON.stringify(response.data));
        setUser(response.data);
        setFormData(response.data);
        setOriginalData(JSON.parse(JSON.stringify(response.data)));
        setProfileImagePreview(response.data.profileImage);
        // Dispatch custom event for Navbar and other components to update
        window.dispatchEvent(new Event('profileUpdated'));
        showToast('Profile updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Response:', error.response?.data);
      console.error('Status:', error.response?.status);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update profile';
      showToast(errorMsg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-hero">
          <div className="profile-container">
            <div className="profile-card">
              <div className="alert alert-error">
                Please <a href="/login">login</a> to view your profile.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? '✓' : '✗'} {toast.message}
        </div>
      )}

      {/* Hero Section */}
      <section className="profile-hero">
        <div className="profile-container">
          <div className="profile-header-card">
            <div className="profile-header-left">
              <div className="profile-avatar-wrapper clickable-avatar" onClick={triggerImageUpload} title="Click to change profile picture">
                {profileImagePreview ? (
                  <img src={profileImagePreview} alt="Profile" className="profile-avatar-img" />
                ) : (
                  <div className="profile-avatar-initials">{getUserInitials()}</div>
                )}
                <div className="profile-image-overlay">📷 Change</div>
              </div>
              <input
                type="file"
                id="profileImageInput"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleProfileImageChange}
                className="image-input-hidden"
              />
              <div className="profile-header-info">
                <h1 className="profile-name">{formData.name}</h1>
                <p className="profile-type-badge">
                  {user.userType === 'professional' ? '👔 Professional' : '👤 Customer'}
                </p>
                <p className="profile-email">{formData.email}</p>
              </div>
            </div>
            <div className="profile-header-stats">
              <div className="stat-item">
                <span className="stat-label">Member Since</span>
                <span className="stat-value">{new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Account Status</span>
                <span className="stat-value verified">✓ Active</span>
              </div>
              {user.userType === 'professional' && (
                <div className="stat-item">
                  <span className="stat-label">Hourly Rate</span>
                  <span className="stat-value">₹{formData.hourlyRate || '—'}/hr</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Profile Content */}
      <section className="profile-section">
        <div className="profile-container">
          {/* Tab Navigation */}
          <div className="profile-tabs">
            <button
              className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              👤 Personal
            </button>
            {user.userType === 'customer' && (
              <button
                className={`tab-btn ${activeTab === 'address' ? 'active' : ''}`}
                onClick={() => setActiveTab('address')}
              >
                📍 Address
              </button>
            )}
            {user.userType === 'professional' && (
              <button
                className={`tab-btn ${activeTab === 'professional' ? 'active' : ''}`}
                onClick={() => setActiveTab('professional')}
              >
                💼 Professional
              </button>
            )}
            <button
              className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              🔒 Security
            </button>
          </div>

          {/* Tab Content */}
          <div className="profile-card">
            {/* Personal Tab */}
            {activeTab === 'personal' && (
              <div className="tab-content">
                <div className="section-header">
                  <div>
                    <h2>Personal Information</h2>
                    <p>Update your basic profile details</p>
                  </div>
                  {hasChanges && <span className="unsaved-indicator">● Unsaved changes</span>}
                </div>

                <div className="form-content">
                  {/* Profile Picture Hint */}
                  <div className="profile-picture-hint">
                    <p>💡 <strong>Pro Tip:</strong> Click your profile picture at the top to change it instantly!</p>
                  </div>

                  {/* Basic Info Form */}
                  <div className="form-section">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="name">Full Name *</label>
                        <input
                          id="name"
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="phone">Phone *</label>
                        <input
                          id="phone"
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email *</label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Enter your email"
                      />
                      <small className="form-hint">Email cannot be changed for security</small>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="form-actions">
                    <button
                      onClick={handleSubmit}
                      disabled={!hasChanges || isSaving}
                      className="btn btn-primary"
                    >
                      {isSaving ? '💾 Saving...' : '💾 Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Address Tab (Customer Only) */}
            {activeTab === 'address' && user.userType === 'customer' && (
              <div className="tab-content">
                <div className="section-header">
                  <div>
                    <h2>Address Information</h2>
                    <p>Update your delivery and service address</p>
                  </div>
                  {hasChanges && <span className="unsaved-indicator">● Unsaved changes</span>}
                </div>

                <div className="form-content">
                  <div className="form-section">
                    <div className="form-group">
                      <label htmlFor="street">Street Address</label>
                      <input
                        id="street"
                        type="text"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Enter your street address"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="city">City</label>
                        <input
                          id="city"
                          type="text"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Enter your city"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="zipCode">Zip Code</label>
                        <input
                          id="zipCode"
                          type="text"
                          name="address.zipCode"
                          value={formData.address.zipCode}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Enter your zip code"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      onClick={handleSubmit}
                      disabled={!hasChanges || isSaving}
                      className="btn btn-primary"
                    >
                      {isSaving ? '💾 Saving...' : '💾 Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Professional Tab (Professional Only) */}
            {activeTab === 'professional' && user.userType === 'professional' && (
              <div className="tab-content">
                <div className="section-header">
                  <div>
                    <h2>Professional Profile</h2>
                    <p>Manage your professional details and rates</p>
                  </div>
                  {hasChanges && <span className="unsaved-indicator">● Unsaved changes</span>}
                </div>

                <div className="form-content">
                  <div className="form-section">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Profession</label>
                        <input
                          type="text"
                          value={formData.profession}
                          className="form-input"
                          disabled
                          title="Profession cannot be changed"
                        />
                        <small className="form-hint">Set during registration</small>
                      </div>
                      <div className="form-group">
                        <label>Experience</label>
                        <input
                          type="text"
                          value={formData.experience}
                          className="form-input"
                          disabled
                          title="Experience cannot be changed"
                        />
                        <small className="form-hint">Set during registration</small>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="hourlyRate">Hourly Rate (₹)</label>
                      <input
                        id="hourlyRate"
                        type="number"
                        name="hourlyRate"
                        value={formData.hourlyRate}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Enter your hourly rate"
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="bio">Professional Bio</label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        className="form-textarea"
                        placeholder="Tell clients about your expertise and experience"
                        rows="5"
                      />
                      <small className="form-hint">{formData.bio.length}/500 characters</small>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      onClick={handleSubmit}
                      disabled={!hasChanges || isSaving}
                      className="btn btn-primary"
                    >
                      {isSaving ? '💾 Saving...' : '💾 Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="tab-content">
                <div className="section-header">
                  <div>
                    <h2>Security & Privacy</h2>
                    <p>Manage your account security settings</p>
                  </div>
                </div>

                <div className="form-content">
                  <div className="security-item">
                    <div className="security-info">
                      <h3>🔐 Password</h3>
                      <p>Last changed: {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                    <a href="/settings" className="btn btn-secondary">Change Password</a>
                  </div>

                  <div className="security-item">
                    <div className="security-info">
                      <h3>📧 Email Verification</h3>
                      <p>Your email is verified and secure</p>
                    </div>
                    <span className="badge badge-success">✓ Verified</span>
                  </div>

                  <div className="security-item">
                    <div className="security-info">
                      <h3>📱 Two-Factor Authentication</h3>
                      <p>Add an extra layer of security to your account</p>
                    </div>
                    <button className="btn btn-secondary">Enable 2FA</button>
                  </div>

                  <div className="security-item">
                    <div className="security-info">
                      <h3>🗑️ Delete Account</h3>
                      <p>Permanently delete your account and all associated data</p>
                    </div>
                    <button className="btn btn-danger">Delete Account</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;
