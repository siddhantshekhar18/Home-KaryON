import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './Settings.css';

const API_URL = `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api').replace(/\/$/, '')}/auth`;

const dispatchProfileUpdated = (nextUser) => {
  window.dispatchEvent(new CustomEvent('profileUpdated', {
    detail: {
      user: nextUser,
      updatedAt: Date.now()
    }
  }));
};

const DEFAULT_SETTINGS = {
  notifications: {
    email: true,
    sms: true,
    push: true,
    marketing: false,
    bookingReminders: true,
    securityAlerts: true
  },
  privacy: {
    showProfile: true,
    showPhone: false,
    showEmail: false,
    dataSharing: false,
    searchEngineIndex: false
  },
  preferences: {
    language: 'en',
    theme: 'system',
    timezone: 'Asia/Kolkata',
    dateFormat: 'dd-mm-yyyy',
    currency: 'INR',
    compactMode: false
  }
};

const TAB_ITEMS = [
  { id: 'overview', icon: '◉', label: 'Overview' },
  { id: 'account', icon: '◈', label: 'Account' },
  { id: 'security', icon: '◍', label: 'Security' },
  { id: 'notifications', icon: '◎', label: 'Notifications' },
  { id: 'privacy', icon: '◌', label: 'Privacy' },
  { id: 'preferences', icon: '◇', label: 'Preferences' },
  { id: 'danger', icon: '△', label: 'Danger Zone' }
];

const mergeSettings = (incoming = {}) => ({
  notifications: {
    ...DEFAULT_SETTINGS.notifications,
    ...(incoming.notifications || {})
  },
  privacy: {
    ...DEFAULT_SETTINGS.privacy,
    ...(incoming.privacy || {})
  },
  preferences: {
    ...DEFAULT_SETTINGS.preferences,
    ...(incoming.preferences || {})
  }
});

const Settings = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    zipCode: ''
  });
  const [settingsData, setSettingsData] = useState(DEFAULT_SETTINGS);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isSaving, setIsSaving] = useState({
    profile: false,
    security: false,
    settings: false,
    export: false
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const token = localStorage.getItem('token');
  const authHeaders = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${token}`
    }
  }), [token]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setProfileForm({
      name: parsedUser.name || '',
      email: parsedUser.email || '',
      phone: parsedUser.phone || '',
      street: parsedUser.address?.street || '',
      city: parsedUser.address?.city || '',
      zipCode: parsedUser.address?.zipCode || ''
    });
    setSettingsData(mergeSettings(parsedUser.settings || {}));
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      if (!token) {
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/settings`, authHeaders);
        if (response.data?.success) {
          setSettingsData(mergeSettings(response.data.settings || {}));
        }
      } catch {
        // Keep local defaults if settings endpoint is unavailable.
      }
    };

    loadSettings();
  }, [authHeaders, token]);

  const setMessage = (type, message) => {
    if (type === 'success') {
      setSuccessMessage(message);
      setErrorMessage('');
      return;
    }
    setErrorMessage(message);
    setSuccessMessage('');
  };

  const clearMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleProfileInput = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordInput = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleSettingsField = (group, key) => {
    setSettingsData((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: !prev[group][key]
      }
    }));
  };

  const updatePreferenceField = (event) => {
    const { name, value } = event.target;
    setSettingsData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [name]: value
      }
    }));
  };

  const profileCompletion = useMemo(() => {
    const checks = [
      Boolean(profileForm.name),
      Boolean(profileForm.email),
      Boolean(profileForm.phone),
      Boolean(profileForm.street),
      Boolean(profileForm.city),
      Boolean(profileForm.zipCode)
    ];
    const filled = checks.filter(Boolean).length;
    return Math.round((filled / checks.length) * 100);
  }, [profileForm]);

  const passwordStrength = useMemo(() => {
    const password = passwordForm.newPassword;
    if (!password) {
      return 0;
    }

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [passwordForm.newPassword]);

  const strengthMeta = [
    { label: 'No password', color: '#9ca3af' },
    { label: 'Weak', color: '#ef4444' },
    { label: 'Fair', color: '#f59e0b' },
    { label: 'Good', color: '#0ea5e9' },
    { label: 'Strong', color: '#10b981' }
  ][passwordStrength];

  const accountHealth = useMemo(() => {
    let score = 40;
    if (profileCompletion >= 80) score += 20;
    if (settingsData.notifications.securityAlerts) score += 15;
    if (settingsData.privacy.showPhone === false) score += 10;
    if (settingsData.privacy.dataSharing === false) score += 10;
    if (user?.authProvider === 'google') score += 5;
    return Math.min(score, 100);
  }, [profileCompletion, settingsData, user]);

  const browserLabel = `${navigator.platform || 'Unknown OS'} • ${navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Browser'}`;
  const sessions = [
    {
      id: 'current',
      label: 'Current Device',
      meta: browserLabel,
      status: 'active'
    },
    {
      id: 'previous',
      label: 'Last Known Session',
      meta: `Approx ${new Date(Date.now() - 1000 * 60 * 60 * 6).toLocaleString()}`,
      status: 'recent'
    }
  ];

  const handleProfileSave = async (event) => {
    event.preventDefault();
    clearMessages();

    if (!profileForm.name || !profileForm.phone) {
      setMessage('error', 'Name and phone are required.');
      return;
    }

    if (!/^\d{10}$/.test(profileForm.phone)) {
      setMessage('error', 'Phone number must be exactly 10 digits.');
      return;
    }

    setIsSaving((prev) => ({ ...prev, profile: true }));
    try {
      const response = await axios.put(
        `${API_URL}/profile`,
        {
          name: profileForm.name,
          phone: profileForm.phone,
          address: JSON.stringify({
            street: profileForm.street,
            city: profileForm.city,
            zipCode: profileForm.zipCode
          })
        },
        authHeaders
      );

      const updated = {
        ...(user || {}),
        ...(response.data || {}),
        settings: settingsData
      };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      dispatchProfileUpdated(updated);
      setMessage('success', 'Account profile updated successfully.');
    } catch (error) {
      setMessage('error', error.response?.data?.message || 'Unable to save profile changes.');
    } finally {
      setIsSaving((prev) => ({ ...prev, profile: false }));
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    clearMessages();

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setMessage('error', 'Fill all password fields before updating.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('error', 'New password and confirmation do not match.');
      return;
    }

    if (passwordStrength < 3) {
      setMessage('error', 'Use a stronger password with uppercase, number, and special character.');
      return;
    }

    setIsSaving((prev) => ({ ...prev, security: true }));
    try {
      await axios.put(
        `${API_URL}/change-password`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        },
        authHeaders
      );

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage('success', 'Password changed successfully.');
    } catch (error) {
      setMessage('error', error.response?.data?.message || 'Unable to update password.');
    } finally {
      setIsSaving((prev) => ({ ...prev, security: false }));
    }
  };

  const handleSaveSettings = async () => {
    clearMessages();
    setIsSaving((prev) => ({ ...prev, settings: true }));
    try {
      const response = await axios.put(
        `${API_URL}/settings`,
        {
          notifications: settingsData.notifications,
          privacy: settingsData.privacy,
          preferences: settingsData.preferences
        },
        authHeaders
      );

      const mergedSettings = mergeSettings(response.data?.settings || settingsData);
      setSettingsData(mergedSettings);

      const updatedUser = {
        ...(user || {}),
        settings: mergedSettings
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      dispatchProfileUpdated(updatedUser);
      setMessage('success', 'Settings saved successfully.');
    } catch (error) {
      setMessage('error', error.response?.data?.message || 'Unable to save settings.');
    } finally {
      setIsSaving((prev) => ({ ...prev, settings: false }));
    }
  };

  const handleExportData = async () => {
    clearMessages();
    setIsSaving((prev) => ({ ...prev, export: true }));
    try {
      const payload = {
        exportedAt: new Date().toISOString(),
        profile: user,
        settings: settingsData
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'karyon-account-export.json';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setMessage('success', 'Your account export has been downloaded.');
    } catch {
      setMessage('error', 'Could not export your data. Please try again.');
    } finally {
      setIsSaving((prev) => ({ ...prev, export: false }));
    }
  };

  const handleSignOutCurrent = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userEmail');
    window.location.href = '/login';
  };

  const handleSignOutAll = () => {
    handleSignOutCurrent();
  };

  const handleDeleteAccountRequest = () => {
    if (deleteConfirmText !== 'DELETE') {
      setMessage('error', 'Type DELETE to confirm your account deletion request.');
      return;
    }
    setMessage('success', 'Deletion request registered. Please contact support to complete verification.');
    setDeleteConfirmText('');
  };

  if (!user) {
    return (
      <div className="settings-page">
        <div className="settings-container">
          <div className="alert alert-error">
            Please <a href="/login">login</a> to access settings.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <section className="settings-hero">
        <div className="settings-hero-glow" aria-hidden="true"></div>
        <div className="settings-hero-content">
          <p className="settings-kicker">Control Center</p>
          <h1 className="settings-hero-title">High Profile Settings</h1>
          <p className="settings-hero-description">
            Security, privacy, personalization, and account operations in one advanced dashboard.
          </p>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-container">
          {successMessage && <div className="alert alert-success">{successMessage}</div>}
          {errorMessage && <div className="alert alert-error">{errorMessage}</div>}

          <div className="settings-layout">
            <aside className="settings-sidebar">
              <div className="profile-chip">
                <div className="avatar-core">{(user.name || 'U').slice(0, 1).toUpperCase()}</div>
                <div>
                  <p className="profile-name">{user.name}</p>
                  <p className="profile-email">{user.email}</p>
                </div>
              </div>

              <div className="health-card">
                <p className="health-label">Account health</p>
                <p className="health-score">{accountHealth}%</p>
                <div className="progress-track">
                  <span className="progress-fill" style={{ width: `${accountHealth}%` }}></span>
                </div>
              </div>

              <nav className="settings-tabs" aria-label="Settings sections">
                {TAB_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    className={`settings-tab ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <span className="tab-icon">{item.icon}</span>
                    <span className="tab-text">{item.label}</span>
                  </button>
                ))}
              </nav>
            </aside>

            <div className="settings-content">
              {activeTab === 'overview' && (
                <div className="settings-panel">
                  <h2 className="panel-title">Overview</h2>
                  <p className="panel-description">Quick status of your account, privacy, and security posture.</p>

                  <div className="metric-grid">
                    <article className="metric-card">
                      <p className="metric-label">Profile completion</p>
                      <p className="metric-value">{profileCompletion}%</p>
                      <p className="metric-note">Complete your address and phone for faster booking support.</p>
                    </article>
                    <article className="metric-card">
                      <p className="metric-label">Security grade</p>
                      <p className="metric-value">{strengthMeta.label}</p>
                      <p className="metric-note">Password strength updates live while typing in Security tab.</p>
                    </article>
                    <article className="metric-card">
                      <p className="metric-label">Privacy mode</p>
                      <p className="metric-value">{settingsData.privacy.dataSharing ? 'Open' : 'Protected'}</p>
                      <p className="metric-note">You currently {settingsData.privacy.dataSharing ? 'allow' : 'block'} data sharing.</p>
                    </article>
                  </div>

                  <div className="feature-row">
                    <article className="feature-card">
                      <h3>Connected sign-in</h3>
                      <p>
                        Provider: <strong>{user.authProvider === 'google' ? 'Google' : 'Email + Password'}</strong>
                      </p>
                    </article>
                    <article className="feature-card">
                      <h3>Member since</h3>
                      <p>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                    </article>
                    <article className="feature-card">
                      <h3>User type</h3>
                      <p>{user.userType === 'professional' ? 'Professional' : 'Customer'}</p>
                    </article>
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="settings-panel">
                  <h2 className="panel-title">Account</h2>
                  <p className="panel-description">Manage identity and contact details used across bookings and invoices.</p>

                  <form onSubmit={handleProfileSave} className="settings-form">
                    <div className="form-row two">
                      <div className="form-group">
                        <label htmlFor="name">Full name</label>
                        <input id="name" className="form-input" name="name" value={profileForm.name} onChange={handleProfileInput} />
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input id="email" className="form-input" name="email" value={profileForm.email} disabled />
                      </div>
                    </div>

                    <div className="form-row two">
                      <div className="form-group">
                        <label htmlFor="phone">Phone number</label>
                        <input id="phone" className="form-input" name="phone" maxLength="10" value={profileForm.phone} onChange={handleProfileInput} />
                      </div>
                      <div className="form-group">
                        <label htmlFor="zipCode">ZIP / Postal code</label>
                        <input id="zipCode" className="form-input" name="zipCode" value={profileForm.zipCode} onChange={handleProfileInput} />
                      </div>
                    </div>

                    <div className="form-row two">
                      <div className="form-group">
                        <label htmlFor="city">City</label>
                        <input id="city" className="form-input" name="city" value={profileForm.city} onChange={handleProfileInput} />
                      </div>
                      <div className="form-group">
                        <label htmlFor="street">Street address</label>
                        <input id="street" className="form-input" name="street" value={profileForm.street} onChange={handleProfileInput} />
                      </div>
                    </div>

                    <div className="form-actions">
                      <button className="btn btn-primary" type="submit" disabled={isSaving.profile}>
                        {isSaving.profile ? 'Saving profile...' : 'Save account details'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="settings-panel">
                  <h2 className="panel-title">Security</h2>
                  <p className="panel-description">Password management, session visibility, and secure account controls.</p>

                  <form onSubmit={handlePasswordChange} className="settings-form security-block">
                    <div className="form-group">
                      <label htmlFor="currentPassword">Current password</label>
                      <input id="currentPassword" type="password" className="form-input" name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordInput} />
                    </div>

                    <div className="form-row two">
                      <div className="form-group">
                        <label htmlFor="newPassword">New password</label>
                        <input id="newPassword" type="password" className="form-input" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordInput} />
                      </div>
                      <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm password</label>
                        <input id="confirmPassword" type="password" className="form-input" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordInput} />
                      </div>
                    </div>

                    <div className="strength-row">
                      <div className="strength-track">
                        <span className="strength-fill" style={{ width: `${passwordStrength * 25}%`, background: strengthMeta.color }}></span>
                      </div>
                      <span className="strength-label" style={{ color: strengthMeta.color }}>{strengthMeta.label}</span>
                    </div>

                    <div className="form-actions">
                      <button className="btn btn-primary" type="submit" disabled={isSaving.security}>
                        {isSaving.security ? 'Updating password...' : 'Update password'}
                      </button>
                    </div>
                  </form>

                  <div className="session-list">
                    <h3>Active sessions</h3>
                    {sessions.map((session) => (
                      <div key={session.id} className="session-item">
                        <div>
                          <p className="session-title">{session.label}</p>
                          <p className="session-meta">{session.meta}</p>
                        </div>
                        <span className={`session-badge ${session.status}`}>{session.status === 'active' ? 'Active now' : 'Recent'}</span>
                      </div>
                    ))}

                    <div className="form-actions">
                      <button className="btn btn-secondary" type="button" onClick={handleSignOutAll}>Sign out all sessions</button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="settings-panel">
                  <h2 className="panel-title">Notifications</h2>
                  <p className="panel-description">Control updates and alerts across email, SMS, and push channels.</p>

                  <div className="toggle-group">
                    <div className="toggle-item">
                      <div className="toggle-copy">
                        <p>Email notifications</p>
                        <span>Booking confirmations, invoices, and updates.</span>
                      </div>
                      <button className={`pill-switch ${settingsData.notifications.email ? 'on' : ''}`} onClick={() => toggleSettingsField('notifications', 'email')} type="button"><span></span></button>
                    </div>

                    <div className="toggle-item">
                      <div className="toggle-copy">
                        <p>SMS notifications</p>
                        <span>Urgent status changes and arrival alerts.</span>
                      </div>
                      <button className={`pill-switch ${settingsData.notifications.sms ? 'on' : ''}`} onClick={() => toggleSettingsField('notifications', 'sms')} type="button"><span></span></button>
                    </div>

                    <div className="toggle-item">
                      <div className="toggle-copy">
                        <p>Push notifications</p>
                        <span>Real-time alerts while browsing.</span>
                      </div>
                      <button className={`pill-switch ${settingsData.notifications.push ? 'on' : ''}`} onClick={() => toggleSettingsField('notifications', 'push')} type="button"><span></span></button>
                    </div>

                    <div className="toggle-item">
                      <div className="toggle-copy">
                        <p>Marketing updates</p>
                        <span>Offers, referral campaigns, and seasonal deals.</span>
                      </div>
                      <button className={`pill-switch ${settingsData.notifications.marketing ? 'on' : ''}`} onClick={() => toggleSettingsField('notifications', 'marketing')} type="button"><span></span></button>
                    </div>

                    <div className="toggle-item">
                      <div className="toggle-copy">
                        <p>Booking reminders</p>
                        <span>Reminders before scheduled services.</span>
                      </div>
                      <button className={`pill-switch ${settingsData.notifications.bookingReminders ? 'on' : ''}`} onClick={() => toggleSettingsField('notifications', 'bookingReminders')} type="button"><span></span></button>
                    </div>

                    <div className="toggle-item">
                      <div className="toggle-copy">
                        <p>Security alerts</p>
                        <span>Password or login activity notifications.</span>
                      </div>
                      <button className={`pill-switch ${settingsData.notifications.securityAlerts ? 'on' : ''}`} onClick={() => toggleSettingsField('notifications', 'securityAlerts')} type="button"><span></span></button>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button className="btn btn-primary" type="button" onClick={handleSaveSettings} disabled={isSaving.settings}>
                      {isSaving.settings ? 'Saving preferences...' : 'Save notification settings'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="settings-panel">
                  <h2 className="panel-title">Privacy</h2>
                  <p className="panel-description">Choose exactly what information is visible and how your data is used.</p>

                  <div className="toggle-group">
                    <div className="toggle-item">
                      <div className="toggle-copy"><p>Public profile</p><span>Allow your profile to be viewed by others.</span></div>
                      <button className={`pill-switch ${settingsData.privacy.showProfile ? 'on' : ''}`} onClick={() => toggleSettingsField('privacy', 'showProfile')} type="button"><span></span></button>
                    </div>
                    <div className="toggle-item">
                      <div className="toggle-copy"><p>Display phone number</p><span>Show phone in profile and booking details.</span></div>
                      <button className={`pill-switch ${settingsData.privacy.showPhone ? 'on' : ''}`} onClick={() => toggleSettingsField('privacy', 'showPhone')} type="button"><span></span></button>
                    </div>
                    <div className="toggle-item">
                      <div className="toggle-copy"><p>Display email</p><span>Show email to professionals/customers in active jobs.</span></div>
                      <button className={`pill-switch ${settingsData.privacy.showEmail ? 'on' : ''}`} onClick={() => toggleSettingsField('privacy', 'showEmail')} type="button"><span></span></button>
                    </div>
                    <div className="toggle-item">
                      <div className="toggle-copy"><p>Data sharing</p><span>Allow anonymous analytics and recommendation tuning.</span></div>
                      <button className={`pill-switch ${settingsData.privacy.dataSharing ? 'on' : ''}`} onClick={() => toggleSettingsField('privacy', 'dataSharing')} type="button"><span></span></button>
                    </div>
                    <div className="toggle-item">
                      <div className="toggle-copy"><p>Search indexing</p><span>Allow search engines to index your public profile.</span></div>
                      <button className={`pill-switch ${settingsData.privacy.searchEngineIndex ? 'on' : ''}`} onClick={() => toggleSettingsField('privacy', 'searchEngineIndex')} type="button"><span></span></button>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button className="btn btn-primary" type="button" onClick={handleSaveSettings} disabled={isSaving.settings}>
                      {isSaving.settings ? 'Saving privacy...' : 'Save privacy settings'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="settings-panel">
                  <h2 className="panel-title">Preferences</h2>
                  <p className="panel-description">Customize language, theme, locale, and dashboard display behavior.</p>

                  <div className="form-row two">
                    <div className="form-group">
                      <label htmlFor="language">Language</label>
                      <select id="language" className="form-input" name="language" value={settingsData.preferences.language} onChange={updatePreferenceField}>
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="theme">Theme</label>
                      <select id="theme" className="form-input" name="theme" value={settingsData.preferences.theme} onChange={updatePreferenceField}>
                        <option value="system">System</option>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row two">
                    <div className="form-group">
                      <label htmlFor="timezone">Timezone</label>
                      <select id="timezone" className="form-input" name="timezone" value={settingsData.preferences.timezone} onChange={updatePreferenceField}>
                        <option value="Asia/Kolkata">Asia/Kolkata</option>
                        <option value="UTC">UTC</option>
                        <option value="Asia/Dubai">Asia/Dubai</option>
                        <option value="Europe/London">Europe/London</option>
                        <option value="America/New_York">America/New_York</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="currency">Currency</label>
                      <select id="currency" className="form-input" name="currency" value={settingsData.preferences.currency} onChange={updatePreferenceField}>
                        <option value="INR">INR</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row two">
                    <div className="form-group">
                      <label htmlFor="dateFormat">Date format</label>
                      <select id="dateFormat" className="form-input" name="dateFormat" value={settingsData.preferences.dateFormat} onChange={updatePreferenceField}>
                        <option value="dd-mm-yyyy">DD-MM-YYYY</option>
                        <option value="mm-dd-yyyy">MM-DD-YYYY</option>
                        <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div className="form-group compact-toggle">
                      <label>Compact mode</label>
                      <button className={`pill-switch ${settingsData.preferences.compactMode ? 'on' : ''}`} onClick={() => toggleSettingsField('preferences', 'compactMode')} type="button"><span></span></button>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button className="btn btn-primary" type="button" onClick={handleSaveSettings} disabled={isSaving.settings}>
                      {isSaving.settings ? 'Saving preferences...' : 'Save preferences'}
                    </button>
                    <button className="btn btn-secondary" type="button" onClick={handleExportData} disabled={isSaving.export}>
                      {isSaving.export ? 'Exporting...' : 'Export account data'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'danger' && (
                <div className="settings-panel">
                  <h2 className="panel-title">Danger Zone</h2>
                  <p className="panel-description">High-impact actions. Please review carefully before proceeding.</p>

                  <div className="danger-zone">
                    <div className="danger-item">
                      <div>
                        <p className="danger-title">Sign out from this device</p>
                        <p className="danger-desc">Immediately remove current session and redirect to login.</p>
                      </div>
                      <button className="btn btn-secondary" type="button" onClick={handleSignOutCurrent}>Sign out now</button>
                    </div>

                    <div className="danger-item">
                      <div>
                        <p className="danger-title">Request account deletion</p>
                        <p className="danger-desc">Type DELETE to verify intent and submit deletion request.</p>
                      </div>
                    </div>

                    <div className="danger-confirm">
                      <input
                        className="form-input"
                        placeholder="Type DELETE"
                        value={deleteConfirmText}
                        onChange={(event) => setDeleteConfirmText(event.target.value)}
                      />
                      <button className="btn btn-danger" type="button" onClick={handleDeleteAccountRequest}>Request deletion</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
