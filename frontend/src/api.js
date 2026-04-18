const FALLBACK_API_BASE_URL = 'http://localhost:5001/api';

export const getApiBaseUrl = () => {
  const configuredBase = String(import.meta.env.VITE_API_BASE_URL || '').trim();
  if (!configuredBase || configuredBase.startsWith('/')) {
    return FALLBACK_API_BASE_URL;
  }
  return configuredBase.replace(/\/$/, '');
};

const API_BASE_URL = getApiBaseUrl();
const API_BASE_CANDIDATES = Array.from(new Set([
  API_BASE_URL,
  typeof window !== 'undefined' ? `${window.location.origin}/api` : '',
  FALLBACK_API_BASE_URL
].filter(Boolean).map((base) => base.replace(/\/$/, ''))));

const parseTextPreview = (rawText = '') => rawText.replace(/\s+/g, ' ').trim().slice(0, 180);

// Helper function for making API requests
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  let lastError = null;

  for (const baseUrl of API_BASE_CANDIDATES) {
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, config);
      const contentType = response.headers.get('content-type') || '';

      if (!contentType.includes('application/json')) {
        const rawText = await response.text();
        const preview = parseTextPreview(rawText);
        lastError = new Error(`Server returned a non-JSON response for ${endpoint}. ${preview}`);
        continue;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Something went wrong');
};

// Auth API
export const authAPI = {
  // Register
  register: (userData) => 
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  // Login with email
  loginEmail: (email, password) =>
    apiRequest('/auth/login/email', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Send OTP for phone login
  sendPhoneOTP: (phone) =>
    apiRequest('/auth/login/phone/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  // Verify OTP and login
  verifyPhoneOTP: (phone, otp) =>
    apiRequest('/auth/login/phone/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    }),

  // Get user profile
  getProfile: () => apiRequest('/auth/profile'),

  // Update profile
  updateProfile: (userData) =>
    apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
};

// Services API
export const servicesAPI = {
  // Get all services
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/services${queryString ? `?${queryString}` : ''}`);
  },

  // Get service by ID
  getById: (id) => apiRequest(`/services/${id}`),

  // Get categories
  getCategories: () => apiRequest('/services/categories/list'),
};

// Bookings API
export const bookingsAPI = {
  // Create booking
  create: (bookingData) =>
    apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    }),

  // Get all bookings
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/bookings${queryString ? `?${queryString}` : ''}`);
  },

  // Get booking by ID
  getById: (id) => apiRequest(`/bookings/${id}`),

  // Update booking
  update: (id, bookingData) =>
    apiRequest(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookingData),
    }),

  // Cancel booking
  cancel: (id) =>
    apiRequest(`/bookings/${id}/cancel`, {
      method: 'PUT',
    }),

  // Reschedule booking
  reschedule: (id, date, time, email) =>
    apiRequest(`/bookings/${id}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify({ date, time, email }),
    }),

  // Accept booking (Professional)
  accept: (id) =>
    apiRequest(`/bookings/${id}/accept`, {
      method: 'PUT',
    }),

  // Add review
  addReview: (id, rating, review) =>
    apiRequest(`/bookings/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify({ rating, review }),
    }),

  // Get live location for a booking (supports guest lookup by email)
  getLiveLocation: (id, email) => {
    const query = email ? `?email=${encodeURIComponent(email)}` : '';
    return apiRequest(`/bookings/${id}/location${query}`);
  },

  // Update live location for assigned professional
  updateLiveLocation: (id, locationPayload) =>
    apiRequest(`/bookings/${id}/location`, {
      method: 'PUT',
      body: JSON.stringify(locationPayload),
    }),

  // Stop live location sharing for assigned professional
  stopLiveLocation: (id) =>
    apiRequest(`/bookings/${id}/location/stop`, {
      method: 'PUT',
    }),

  // Get available bookings (for professionals)
  getAvailable: () => apiRequest('/bookings/available'),

  // Get all bookings (for admin/professionals)
  getAllBookings: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/bookings/all${queryString ? `?${queryString}` : ''}`);
  },

  // Get booking statistics
  getStats: () => apiRequest('/bookings/stats/user'),

  // Get public homepage statistics
  getHomeStats: () => apiRequest('/bookings/home-stats'),
};

// Professional API
export const professionalAPI = {
  // Get available (pending) jobs matching professional's service type
  getAvailableJobs: () => apiRequest('/bookings/available'),

  // Get professional's own active + past jobs
  getMyJobs: () => apiRequest('/bookings/professional/jobs'),

  // Accept a booking
  acceptJob: (id) =>
    apiRequest(`/bookings/${id}/accept`, { method: 'PUT' }),

  // Reject / decline a booking
  rejectJob: (id, reason = '') =>
    apiRequest(`/bookings/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    }),

  // Move accepted booking to in-progress
  startJob: (id) =>
    apiRequest(`/bookings/${id}/start`, {
      method: 'PUT',
    }),

  // Mark a booking as completed
  completeJob: (id, finalPrice) =>
    apiRequest(`/bookings/${id}/complete`, {
      method: 'PUT',
      body: JSON.stringify({ finalPrice }),
    }),

  // Professional live location controls
  updateJobLocation: (id, locationPayload) =>
    apiRequest(`/bookings/${id}/location`, {
      method: 'PUT',
      body: JSON.stringify(locationPayload),
    }),

  stopJobLocation: (id) =>
    apiRequest(`/bookings/${id}/location/stop`, {
      method: 'PUT',
    }),
};

// Chat API
export const chatAPI = {
  // Get chat inbox metadata for current user
  getInbox: () => apiRequest('/chat/inbox'),

  // Get conversation for a specific booking
  getBookingChat: (bookingId) => apiRequest(`/chat/booking/${bookingId}`),

  // Mark chat as read for current user
  markAsRead: (bookingId) =>
    apiRequest(`/chat/booking/${bookingId}/read`, {
      method: 'POST',
    }),

  // Send message in a specific booking conversation
  sendMessage: (bookingId, text) =>
    apiRequest(`/chat/booking/${bookingId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),
};

// Contact API
export const contactAPI = {
  // Submit contact form
  submit: (contactData) =>
    apiRequest('/contact', {
      method: 'POST',
      body: JSON.stringify(contactData),
    }),

  // Get all contacts (admin)
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/contact${queryString ? `?${queryString}` : ''}`);
  },

  // Get single contact (admin)
  getById: (id) => apiRequest(`/contact/${id}`),

  // Update contact status (admin)
  update: (id, contactData) =>
    apiRequest(`/contact/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contactData),
    }),

  // Delete contact (admin)
  delete: (id) =>
    apiRequest(`/contact/${id}`, {
      method: 'DELETE',
    }),
};

// Newsletter API
export const newsletterAPI = {
  subscribe: (email, agreedToTerms) =>
    apiRequest('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email, agreedToTerms }),
    }),
};

// Public API
export const publicAPI = {
  // Get platform stats for landing/about pages
  getPlatformStats: () => apiRequest('/auth/public-stats'),
};

const adminRequest = (endpoint, options = {}) => apiRequest(`/admin${endpoint}`, options);

export const adminAPI = {
  getDashboard: () => adminRequest('/dashboard'),

  getUnassignedBookings: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return adminRequest(`/bookings/unassigned${queryString ? `?${queryString}` : ''}`);
  },

  getAssignableProfessionals: (serviceType = '') => {
    const queryString = new URLSearchParams(serviceType ? { serviceType } : {}).toString();
    return adminRequest(`/professionals/assignable${queryString ? `?${queryString}` : ''}`);
  },

  assignBooking: (bookingId, professionalId) =>
    adminRequest(`/bookings/${bookingId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ professionalId })
    }),

  unassignBooking: (bookingId) =>
    adminRequest(`/bookings/${bookingId}/unassign`, {
      method: 'PUT'
    }),

  getUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return adminRequest(`/users${queryString ? `?${queryString}` : ''}`);
  },

  updateUserStatus: (userId, isActive) =>
    adminRequest(`/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive })
    }),

  getReports: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return adminRequest(`/reports${queryString ? `?${queryString}` : ''}`);
  },

  reviewReport: (reportId, payload) =>
    adminRequest(`/reports/${reportId}/review`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
};

export const reportsAPI = {
  create: (payload) =>
    apiRequest('/reports', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getMine: () => apiRequest('/reports/mine')
};

export default API_BASE_URL;
