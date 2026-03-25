import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import API_BASE_URL, { chatAPI } from '../../api';
import './Navbar.css';

const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '');
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

// Simple MD5 hash function for Gravatar (client-side implementation)
const md5 = (string) => {
  const md5chars = '0123456789abcdef';
  let hash = '00000000000000000000000000000000';
  if (string.length === 0) return hash;
  
  // Simple hash implementation for email to MD5
  let idx = 0;
  for (let i = 0; i < string.length; i++) {
    const charCode = string.charCodeAt(i);
    hash = hash.substring(0, idx) + 
           md5chars.charAt((charCode + idx * 13) % 16) + 
           md5chars.charAt((charCode + idx * 7) % 16) + 
           hash.substring(idx + 2);
    idx = (idx + 1) % 32;
  }
  return hash;
};

// Generate Gravatar URL from email
const getGravatarUrl = (email, size = 40) => {
  if (!email) return null;
  const hash = md5(email.toLowerCase().trim());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon&r=PG`;
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [avatarVersion, setAvatarVersion] = useState(0);
  const [failedImageSrc, setFailedImageSrc] = useState('');
  const location = useLocation();

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      return null;
    }

    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  });

  const isLoggedIn = Boolean(user);
  const isProfessional = user?.userType === 'professional';

  const readUserFromStorage = useCallback(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      setUser(null);
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch {
      setUser(null);
    }
  }, []);

  // Listen for localStorage changes to update user info in real-time
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        readUserFromStorage();
        setFailedImageSrc('');
        setAvatarVersion((prev) => prev + 1);
      }
    };

    const handleProfileUpdate = (event) => {
      const nextUser = event?.detail?.user;
      if (nextUser) {
        setUser(nextUser);
      } else {
        readUserFromStorage();
      }
      setFailedImageSrc('');
      setAvatarVersion((prev) => prev + 1);
    };

    const handleWindowFocus = () => {
      readUserFromStorage();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('profileUpdated', handleProfileUpdate);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [readUserFromStorage]);

  const loadUnread = useCallback(async () => {
    if (!isLoggedIn) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await chatAPI.getInbox();
      const total = (response.inbox || []).reduce((sum, item) => sum + (item.unreadCount || 0), 0);
      setUnreadCount(total);
    } catch {
      setUnreadCount(0);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const firstRunId = setTimeout(() => {
      loadUnread();
    }, 0);
    const id = setInterval(loadUnread, 12000);

    return () => {
      clearTimeout(firstRunId);
      clearInterval(id);
    };
  }, [loadUnread, location.pathname]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token }
    });

    socket.on('connect', () => {
      loadUnread();
    });

    socket.on('unread_update', () => {
      loadUnread();
    });

    socket.on('new_message', () => {
      loadUnread();
    });

    return () => {
      socket.disconnect();
    };
  }, [isLoggedIn, loadUnread]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleMenuKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleMenu();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsMenuOpen(false);
    setDropdownOpen(false);
    window.location.href = '/';
  };

  const getUserInitials = () => {
    if (user && user.name) {
      const names = user.name.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return names[0].substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Get profile image - prioritize custom profileImage, then use Gravatar
  const normalizeProfileImage = (rawImage) => {
    const value = String(rawImage || '').trim();
    if (!value) return '';

    if (
      value.startsWith('http://') ||
      value.startsWith('https://') ||
      value.startsWith('data:') ||
      value.startsWith('blob:')
    ) {
      return value;
    }

    if (value.startsWith('/uploads/')) {
      return `${API_ORIGIN}${value}`;
    }

    if (value.startsWith('uploads/')) {
      return `${API_ORIGIN}/${value}`;
    }

    return value;
  };

  const getProfileImage = () => {
    if (user) {
      if (user.profileImage) {
        return normalizeProfileImage(user.profileImage);
      }
      if (user.email) {
        return getGravatarUrl(user.email, 40);
      }
    }
    return null;
  };

  const profileImage = getProfileImage();
  const profileImageWithVersion = profileImage && !profileImage.startsWith('data:')
    ? `${profileImage}${profileImage.includes('?') ? '&' : '?'}v=${avatarVersion}`
    : profileImage;
  const shouldShowImage = Boolean(profileImageWithVersion) && failedImageSrc !== profileImageWithVersion;

  const isLinkActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo and Brand */}
        <div className="navbar-logo">
          <a href="/">
            <img src="/main-logo.png" alt="KaryON Logo" width="170px" height="57px"></img>
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <a href="/" onClick={closeMenu} className={`nav-link ${isLinkActive('/') ? 'active' : ''}`}>Home</a>
          </li>
          <li className="nav-item">
            <a href="/services" onClick={closeMenu} className={`nav-link ${isLinkActive('/services') ? 'active' : ''}`}>Services</a>
          </li>
          <li className="nav-item">
            <a href="/about" onClick={closeMenu} className={`nav-link ${isLinkActive('/about') ? 'active' : ''}`}>About</a>
          </li>
          {isProfessional ? (
            <li className="nav-item">
              <a href="/professional" onClick={closeMenu} className={`nav-link ${isLinkActive('/professional') ? 'active' : ''}`}>My Work</a>
            </li>
          ) : (
            <li className="nav-item">
              <a href="/bookings" onClick={closeMenu} className={`nav-link ${isLinkActive('/bookings') ? 'active' : ''}`}>My Bookings</a>
            </li>
          )}
          <li className="nav-item">
            <a href="/contact" onClick={closeMenu} className={`nav-link ${isLinkActive('/contact') ? 'active' : ''}`}>Contact</a>
          </li>

          <li className="mobile-menu-section">
            {isLoggedIn ? (
              <div className="mobile-user-panel">
                <a href="/profile" className="mobile-user-overview" onClick={closeMenu}>
                  {shouldShowImage ? (
                    <img
                      src={profileImageWithVersion}
                      alt="Profile"
                      className="mobile-user-avatar-img"
                      onError={() => setFailedImageSrc(profileImageWithVersion)}
                    />
                  ) : (
                    <span className="mobile-user-avatar">{getUserInitials()}</span>
                  )}
                  <div className="mobile-user-meta">
                    <span className="mobile-user-name">{user?.name || 'User'}</span>
                    <span className="mobile-user-email">{user?.email || ''}</span>
                  </div>
                </a>
                <div className="mobile-auth-links">
                  <a href="/chat-inbox" onClick={closeMenu} className="mobile-action-link">Messages</a>
                  <a href="/profile" onClick={closeMenu} className="mobile-action-link">My Profile</a>
                  <a href="/settings" onClick={closeMenu} className="mobile-action-link">Settings</a>
                  {isProfessional
                    ? <a href="/professional" onClick={closeMenu} className="mobile-action-link">My Work</a>
                    : <a href="/bookings"     onClick={closeMenu} className="mobile-action-link">My Bookings</a>
                  }
                  <button onClick={handleLogout} className="mobile-action-link logout-link">Logout</button>
                </div>
              </div>
            ) : (
              <div className="mobile-auth-links">
                <a href="/login" onClick={closeMenu} className="mobile-btn mobile-btn-outline">Login</a>
                <a href="/signup" onClick={closeMenu} className="mobile-btn mobile-btn-solid">Sign Up</a>
              </div>
            )}
          </li>
        </ul>

        {/* Right side buttons */}
        <div className="navbar-actions">
          {isLoggedIn ? (
            <>
              <a href="/chat-inbox" className="chat-bell-btn" aria-label="Open messages inbox">
                <span className="chat-bell-icon">💬</span>
                {unreadCount > 0 && (
                  <span className="chat-bell-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
              </a>

              <div className="user-menu" onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
                <button className="user-menu-btn">
                  {/* Show profile image if available, otherwise show initials */}
                  {shouldShowImage ? (
                    <img
                      src={profileImageWithVersion}
                      alt="Profile"
                      className="user-avatar-img"
                      onError={() => setFailedImageSrc(profileImageWithVersion)}
                    />
                  ) : (
                    <span className="user-avatar">{getUserInitials()}</span>
                  )}
                  <span className="user-name">{user?.name || 'User'}</span>
                  <span className="dropdown-arrow">▼</span>
                </button>

                {/* Professional Dropdown */}
                <div className={`user-dropdown ${dropdownOpen ? 'active' : ''}`}>
                  <div className="dropdown-header">
                    <div className="dropdown-user-info">
                      {shouldShowImage ? (
                        <img
                          src={profileImageWithVersion}
                          alt="Profile"
                          className="dropdown-avatar-img"
                          onError={() => setFailedImageSrc(profileImageWithVersion)}
                        />
                      ) : (
                        <div className="dropdown-avatar">{getUserInitials()}</div>
                      )}
                      <div>
                        <span className="dropdown-user-name">{user?.name || 'User'}</span>
                        <span className="dropdown-user-email">{user?.email || ''}</span>
                      </div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <a href="/chat-inbox" className="dropdown-item">
                    <span className="dropdown-icon">💬</span>
                    <span>Messages</span>
                  </a>
                  <a href="/profile" className="dropdown-item">
                    <span className="dropdown-icon">👤</span>
                    <span>My Profile</span>
                  </a>
                  <a href="/settings" className="dropdown-item">
                    <span className="dropdown-icon">⚙️</span>
                    <span>Settings</span>
                  </a>
                  {isProfessional ? (
                    <a href="/professional" className="dropdown-item">
                      <span className="dropdown-icon">🔨</span>
                      <span>My Work</span>
                    </a>
                  ) : (
                    <a href="/bookings" className="dropdown-item">
                      <span className="dropdown-icon">📋</span>
                      <span>My Bookings</span>
                    </a>
                  )}
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item logout-btn">
                    <span className="dropdown-icon">🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <a href="/login" className="btn btn-outline">Login</a>
              <a href="/signup" className="btn btn-primary">Sign Up</a>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <div className="menu-toggle" onClick={toggleMenu} onKeyDown={handleMenuKeyDown} aria-label="Toggle navigation menu" role="button" tabIndex={0}>
            <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="mobile-menu-overlay" onClick={toggleMenu}></div>
      )}
    </nav>
  );
};

export default Navbar;
