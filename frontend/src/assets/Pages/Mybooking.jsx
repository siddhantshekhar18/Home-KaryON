import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import './Mybooking.css';
import API_BASE_URL, { bookingsAPI, chatAPI } from '../../api';

const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const MyBooking = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [lookupEmail, setLookupEmail] = useState('');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });
  const [rescheduleError, setRescheduleError] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [rating, setRating] = useState({});
  const [review, setReview] = useState({});
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatMetaByBooking, setChatMetaByBooking] = useState({});
  const [liveLocationByBooking, setLiveLocationByBooking] = useState({});
  const [shareLocationLoadingByBooking, setShareLocationLoadingByBooking] = useState({});
  const socketRef = useRef(null);

  // Service icon mapping
  const serviceIcons = {
    'Plumbing': '🔧',
    'Electrical': '⚡',
    'Carpentry': '🪚',
    'Cleaning': '🧹',
    'Painting': '🎨',
    'HVAC': '❄️',
    'Moving': '🚛',
    'Gardening': '🌳',
    'Tutoring': '📚',
    'Handyman': '🔨'
  };

  // Fetch bookings from backend
  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterAndSortBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, searchTerm, dateFilter, sortBy, bookings]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check if user is logged in
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userEmail');
      
      let response;
      
      if (token) {
        // Try authenticated request first
        response = await bookingsAPI.getAll();
      } else if (userEmail) {
        // Try with saved email
        response = await fetchBookingsByEmail(userEmail);
      } else {
        // No token and no email - show email modal
        setLoading(false);
        setShowEmailModal(true);
        return;
      }
      
      if (response && response.success) {
        // Transform backend data to frontend format
        const transformedBookings = response.bookings.map(booking => ({
          id: booking._id,
          bookingId: `BKG${booking._id.slice(-6).toUpperCase()}`,
          serviceName: booking.service?.name || booking.service?.type || 'Service',
          serviceType: booking.service?.type || 'Service',
          serviceIcon: serviceIcons[booking.service?.type] || '🔧',
          professionalName: booking.professional?.name || 'Assigning soon...',
          professionalImage: 'https://randomuser.me/api/portraits/men/1.jpg',
          date: booking.schedule?.date || booking.createdAt?.split('T')[0],
          time: booking.schedule?.time || 'Flexible',
          status: booking.status || 'pending',
          price: booking.pricing?.basePrice || 0,
          address: booking.address?.street || '',
          duration: 'To be confirmed',
          paymentMethod: booking.payment?.method || 'cash',
          paymentStatus: booking.payment?.status || 'pending',
          rating: booking.review?.rating || null,
          review: booking.review?.comment || null,
          professionalPhone: booking.professional?.phone || '',
          professionalEmail: '',
          specialInstructions: booking.service?.description || '',
          totalAmount: booking.pricing?.basePrice || 0,
          discount: 0,
          tax: Math.round((booking.pricing?.basePrice || 0) * 0.1),
          finalAmount: booking.pricing?.totalPrice || booking.pricing?.basePrice || 0,
          currency: booking.pricing?.currency || 'INR',
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
          customerEmail: booking.customer?.email,
          professionalUserId: booking.professional?.userId || null
        }));
        
        setBookings(transformedBookings);
      } else {
        // If authenticated request failed, try email lookup
        if (userEmail) {
          response = await fetchBookingsByEmail(userEmail);
          if (response && response.success) {
            const transformedBookings = response.bookings.map(booking => ({
              id: booking._id,
              bookingId: `BKG${booking._id.slice(-6).toUpperCase()}`,
              serviceName: booking.service?.name || booking.service?.type || 'Service',
              serviceType: booking.service?.type || 'Service',
              serviceIcon: serviceIcons[booking.service?.type] || '🔧',
              professionalName: booking.professional?.name || 'Assigning soon...',
              professionalImage: 'https://randomuser.me/api/portraits/men/1.jpg',
              date: booking.schedule?.date || booking.createdAt?.split('T')[0],
              time: booking.schedule?.time || 'Flexible',
              status: booking.status || 'pending',
              price: booking.pricing?.basePrice || 0,
              address: booking.address?.street || '',
              duration: 'To be confirmed',
              paymentMethod: booking.payment?.method || 'cash',
              paymentStatus: booking.payment?.status || 'pending',
              rating: booking.review?.rating || null,
              review: booking.review?.comment || null,
              professionalPhone: booking.professional?.phone || '',
              professionalEmail: '',
              specialInstructions: booking.service?.description || '',
              totalAmount: booking.pricing?.basePrice || 0,
              discount: 0,
              tax: Math.round((booking.pricing?.basePrice || 0) * 0.1),
              finalAmount: booking.pricing?.totalPrice || booking.pricing?.basePrice || 0,
              currency: booking.pricing?.currency || 'INR',
              createdAt: booking.createdAt,
              updatedAt: booking.updatedAt,
              customerEmail: booking.customer?.email,
              professionalUserId: booking.professional?.userId || null
            }));
            setBookings(transformedBookings);
          } else {
            setError('No bookings found');
          }
        } else {
          setError('Failed to load bookings');
        }
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      // Try with saved email
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) {
        try {
          const response = await fetchBookingsByEmail(userEmail);
          if (response && response.success) {
            const transformedBookings = response.bookings.map(booking => ({
              id: booking._id,
              bookingId: `BKG${booking._id.slice(-6).toUpperCase()}`,
              serviceName: booking.service?.name || booking.service?.type || 'Service',
              serviceType: booking.service?.type || 'Service',
              serviceIcon: serviceIcons[booking.service?.type] || '🔧',
              professionalName: booking.professional?.name || 'Assigning soon...',
              professionalImage: 'https://randomuser.me/api/portraits/men/1.jpg',
              date: booking.schedule?.date || booking.createdAt?.split('T')[0],
              time: booking.schedule?.time || 'Flexible',
              status: booking.status || 'pending',
              price: booking.pricing?.basePrice || 0,
              address: booking.address?.street || '',
              duration: 'To be confirmed',
              paymentMethod: booking.payment?.method || 'cash',
              paymentStatus: booking.payment?.status || 'pending',
              rating: booking.review?.rating || null,
              review: booking.review?.comment || null,
              professionalPhone: booking.professional?.phone || '',
              professionalEmail: '',
              specialInstructions: booking.service?.description || '',
              totalAmount: booking.pricing?.basePrice || 0,
              discount: 0,
              tax: Math.round((booking.pricing?.basePrice || 0) * 0.1),
              finalAmount: booking.pricing?.totalPrice || booking.pricing?.basePrice || 0,
              currency: booking.pricing?.currency || 'INR',
              createdAt: booking.createdAt,
              updatedAt: booking.updatedAt,
              customerEmail: booking.customer?.email,
              professionalUserId: booking.professional?.userId || null
            }));
            setBookings(transformedBookings);
            setLoading(false);
            return;
          }
        } catch (emailErr) {
          console.error('Error fetching by email:', emailErr);
        }
      }
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchChatInboxMeta = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setChatMetaByBooking({});
      return;
    }

    try {
      const response = await chatAPI.getInbox();
      const mapped = (response.inbox || []).reduce((acc, item) => {
        acc[String(item.bookingId)] = item;
        return acc;
      }, {});
      setChatMetaByBooking(mapped);
    } catch {
      setChatMetaByBooking({});
    }
  };

  useEffect(() => {
    fetchChatInboxMeta();
  }, [bookings]);

  const getTrackableBookingIds = () => bookings
    .filter((booking) => ['accepted', 'in-progress'].includes(booking.status))
    .map((booking) => booking.id);

  const fetchLiveLocationSnapshot = async () => {
    const activeBookingIds = getTrackableBookingIds();
    if (!activeBookingIds.length) {
      setLiveLocationByBooking({});
      return;
    }

    const guestEmail = localStorage.getItem('userEmail');

    const responses = await Promise.all(activeBookingIds.map(async (bookingId) => {
      try {
        const bookingMeta = bookings.find((booking) => booking.id === bookingId);
        const emailForFallback = bookingMeta?.customerEmail || guestEmail;
        const response = await bookingsAPI.getLiveLocation(bookingId, emailForFallback);
        return {
          bookingId,
          tracking: response?.tracking || { isSharing: false, currentLocation: null }
        };
      } catch {
        return {
          bookingId,
          tracking: { isSharing: false, currentLocation: null }
        };
      }
    }));

    const mapped = responses.reduce((acc, item) => {
      acc[item.bookingId] = item.tracking;
      return acc;
    }, {});

    setLiveLocationByBooking(mapped);
  };

  useEffect(() => {
    fetchLiveLocationSnapshot();
    const intervalId = setInterval(fetchLiveLocationSnapshot, 5000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const activeBookingIds = getTrackableBookingIds();

    if (!token || !activeBookingIds.length) {
      return undefined;
    }

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token }
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      activeBookingIds.forEach((bookingId) => {
        socket.emit('join_booking', { bookingId }, () => {});
      });
    });

    socket.on('location_update', (payload) => {
      const bookingId = payload?.bookingId;
      if (!bookingId) return;
      setLiveLocationByBooking((prev) => ({
        ...prev,
        [bookingId]: payload.tracking || { isSharing: false, currentLocation: null }
      }));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings]);

  // Fetch bookings by email (for guest users)
  const fetchBookingsByEmail = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/guest?email=${encodeURIComponent(email)}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching bookings by email:', err);
      return { success: false, message: err.message };
    }
  };

  // Handle email lookup submission
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!lookupEmail) return;
    
    setLoading(true);
    setError('');
    
    // Save email for future visits
    localStorage.setItem('userEmail', lookupEmail);
    
    try {
      const response = await fetchBookingsByEmail(lookupEmail);
      
      if (response && response.success) {
        const transformedBookings = response.bookings.map(booking => ({
          id: booking._id,
          bookingId: `BKG${booking._id.slice(-6).toUpperCase()}`,
          serviceName: booking.service?.name || booking.service?.type || 'Service',
          serviceType: booking.service?.type || 'Service',
          serviceIcon: serviceIcons[booking.service?.type] || '🔧',
          professionalName: booking.professional?.name || 'Assigning soon...',
          professionalImage: 'https://randomuser.me/api/portraits/men/1.jpg',
          date: booking.schedule?.date || booking.createdAt?.split('T')[0],
          time: booking.schedule?.time || 'Flexible',
          status: booking.status || 'pending',
          price: booking.pricing?.basePrice || 0,
          address: booking.address?.street || '',
          duration: 'To be confirmed',
          paymentMethod: booking.payment?.method || 'cash',
          paymentStatus: booking.payment?.status || 'pending',
          rating: booking.review?.rating || null,
          review: booking.review?.comment || null,
          professionalPhone: booking.professional?.phone || '',
          professionalEmail: '',
          specialInstructions: booking.service?.description || '',
          totalAmount: booking.pricing?.basePrice || 0,
          discount: 0,
          tax: Math.round((booking.pricing?.basePrice || 0) * 0.1),
          finalAmount: booking.pricing?.totalPrice || booking.pricing?.basePrice || 0,
          currency: booking.pricing?.currency || 'INR',
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
          customerEmail: booking.customer?.email,
          professionalUserId: booking.professional?.userId || null
        }));
        
        setBookings(transformedBookings);
        setShowEmailModal(false);
      } else {
        setError('No bookings found for this email');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortBookings = () => {
    let filtered = [...bookings];

    // Filter by status tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(booking => booking.status === activeTab);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.professionalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.bookingId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date
    const today = new Date();
    
    {
      let weekAgo, monthAgo;
      switch(dateFilter) {
        case 'today':
          filtered = filtered.filter(booking => {
            const bookingDate = new Date(booking.date);
            return bookingDate.toDateString() === today.toDateString();
          });
          break;
        case 'week':
          weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          filtered = filtered.filter(booking => new Date(booking.date) >= weekAgo);
          break;
        case 'month':
          monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          filtered = filtered.filter(booking => new Date(booking.date) >= monthAgo);
          break;
        default:
          break;
      }
    }

    // Sort bookings
    {
      switch(sortBy) {
        case 'newest':
          filtered.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
          break;
        case 'oldest':
          filtered.sort((a, b) => new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date));
          break;
        case 'price-high':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'price-low':
          filtered.sort((a, b) => a.price - b.price);
          break;
        default:
          break;
      }
    }

    setFilteredBookings(filtered);
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userEmail');
      
      let response;
      if (token) {
        response = await bookingsAPI.cancel(bookingId);
      } else {
        // Guest cancellation - need email verification
        response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: userEmail })
        });
        response = await response.json();
      }
      
      if (response.success) {
        const updatedBookings = bookings.map(booking =>
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled', cancelReason: cancelReason }
            : booking
        );
        setBookings(updatedBookings);
        setShowCancelModal(false);
        setCancelReason('');
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const handleReschedule = (booking) => {
    setSelectedBooking(booking);
    setRescheduleData({ date: booking.date || '', time: booking.time || '' });
    setRescheduleError('');
    setShowRescheduleModal(true);
  };

  const handleShareMyLocationToChat = async (booking) => {
    if (!booking?.id) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to share live location in chat.');
      return;
    }

    if (!['accepted', 'in-progress'].includes(booking.status)) {
      alert('You can share location only after a professional accepts the booking.');
      return;
    }

    if (!booking.professionalUserId) {
      alert('Professional is not assigned yet.');
      return;
    }

    setShareLocationLoadingByBooking((prev) => ({ ...prev, [booking.id]: true }));

    try {
      const rawAddress = String(booking.address || '').trim();
      const fallbackText = String(booking.specialInstructions || '').trim();

      if (!rawAddress && !fallbackText) {
        alert('No service location details were found in this booking.');
        return;
      }

      const mapsLink = rawAddress
        ? `https://www.google.com/maps?q=${encodeURIComponent(rawAddress)}`
        : '';
      const locationText = rawAddress || fallbackText;
      const message = mapsLink
        ? `📍 Customer service location (from booking form): ${locationText}\nMap: ${mapsLink}`
        : `📍 Customer service location note (from booking): ${locationText}`;

      await chatAPI.sendMessage(
        booking.id,
        message
      );

      fetchChatInboxMeta();
      alert('Service location from your booking has been sent to professional in chat.');
    } catch (err) {
      alert(err.message || 'Unable to share location right now.');
    } finally {
      setShareLocationLoadingByBooking((prev) => ({ ...prev, [booking.id]: false }));
    }
  };

  const submitReschedule = async () => {
    if (!rescheduleData.date || !rescheduleData.time) {
      setRescheduleError('Please select both a new date and time.');
      return;
    }
    const pickedDate = new Date(rescheduleData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (pickedDate < today) {
      setRescheduleError('Please select a present or future date.');
      return;
    }

    setIsRescheduling(true);
    setRescheduleError('');
    try {
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userEmail') || selectedBooking.customerEmail;

      let response;
      if (token) {
        response = await bookingsAPI.reschedule(selectedBooking.id, rescheduleData.date, rescheduleData.time);
      } else {
        // Guest — pass email for verification
        const res = await fetch(`${API_BASE_URL}/bookings/${selectedBooking.id}/reschedule`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: rescheduleData.date, time: rescheduleData.time, email: userEmail })
        });
        response = await res.json();
      }

      if (response.success) {
        setBookings(prev => prev.map(b =>
          b.id === selectedBooking.id
            ? { ...b, date: rescheduleData.date, time: rescheduleData.time, status: b.status === 'accepted' ? 'pending' : b.status }
            : b
        ));
        setShowRescheduleModal(false);
      } else {
        setRescheduleError(response.message || 'Failed to reschedule. Please try again.');
      }
    } catch (err) {
      console.error('Reschedule error:', err);
      setRescheduleError('Could not connect to server. Please try again.');
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleOpenChat = (booking) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to use private chat.');
      navigate('/login', { state: { from: '/bookings' } });
      return;
    }
    navigate(`/chat/${booking.id}`);
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleAddReview = (booking) => {
    setSelectedBookingForReview(booking);
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    try {
      const bookingId = selectedBookingForReview.id;
      const ratingValue = rating[bookingId] || 5;
      const reviewText = review[bookingId] || '';
      
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userEmail');
      
      let response;
      if (token) {
        response = await bookingsAPI.addReview(bookingId, ratingValue, reviewText);
      } else {
        // Guest review - need email verification
        response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/review`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: userEmail, rating: ratingValue, comment: reviewText })
        });
        response = await response.json();
      }
      
      if (response.success) {
        const updatedBookings = bookings.map(booking =>
          booking.id === bookingId
            ? { 
                ...booking, 
                rating: ratingValue,
                review: reviewText
              }
            : booking
        );
        setBookings(updatedBookings);
        setShowReviewModal(false);
        setSelectedBookingForReview(null);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Failed to submit review. Please try again.');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'confirmed':
      case 'accepted':
        return 'status-badge confirmed';
      case 'pending':
        return 'status-badge pending';
      case 'completed':
        return 'status-badge completed';
      case 'cancelled':
      case 'rejected':
        return 'status-badge cancelled';
      case 'in-progress':
        return 'status-badge in-progress';
      default:
        return 'status-badge';
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch(status) {
      case 'paid':
        return 'payment-badge paid';
      case 'pending':
        return 'payment-badge pending';
      case 'failed':
        return 'payment-badge failed';
      case 'refunded':
        return 'payment-badge refunded';
      default:
        return 'payment-badge';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatPrice = (price, currency = 'INR') => {
    return currency === 'INR' ? `₹${(price || 0).toLocaleString()}` : `$${price}`;
  };

  const formatLiveLocationAge = (dateValue) => {
    if (!dateValue) return 'just now';
    const updatedAt = new Date(dateValue).getTime();
    if (Number.isNaN(updatedAt)) return 'just now';

    const diffSeconds = Math.max(0, Math.floor((Date.now() - updatedAt) / 1000));
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h ago`;
  };

  const getMapLink = (latitude, longitude) =>
    `https://www.google.com/maps?q=${encodeURIComponent(latitude)},${encodeURIComponent(longitude)}`;

  const calculateStats = () => {
    const total = bookings.length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const upcoming = bookings.filter(b => b.status === 'accepted' || b.status === 'pending').length;
    const totalSpent = bookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + (b.finalAmount || b.price), 0);
    
    return { total, completed, upcoming, totalSpent };
  };

  const stats = calculateStats();

  return (
    <div className="my-booking">
      {/* Header Section */}
      <div className="booking-header">
        <div className="header-overlay"></div>
        <div className="header-content">
          <h1 className="header-title">
            My <span className="header-highlight">Bookings</span>
          </h1>
          <p className="header-subtitle">
            Manage and track all your service bookings in one place
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card animate-on-scroll">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.total}</h3>
              <p className="stat-label">Total Bookings</p>
            </div>
          </div>
          <div className="stat-card animate-on-scroll">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.completed}</h3>
              <p className="stat-label">Completed</p>
            </div>
          </div>
          <div className="stat-card animate-on-scroll">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.upcoming}</h3>
              <p className="stat-label">Upcoming</p>
            </div>
          </div>
          <div className="stat-card animate-on-scroll">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3 className="stat-value">{formatPrice(stats.totalSpent)}</h3>
              <p className="stat-label">Total Spent</p>
            </div>
          </div>
        </div>
      </div>

      <div className="booking-container">
        {/* Filters and Search */}
        <div className="filters-section">
          <div className="search-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"/>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search by service, professional, or booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <select 
              className="filter-select"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>

            <select 
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="booking-tabs">
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Bookings
          </button>
          <button 
            className={`tab-btn ${activeTab === 'accepted' ? 'active' : ''}`}
            onClick={() => setActiveTab('accepted')}
          >
            Confirmed
          </button>
          <button 
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending
          </button>
          <button 
            className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
          <button 
            className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancelled')}
          >
            Cancelled
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your bookings...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchBookings}>Try Again</button>
          </div>
        )}

        {/* Bookings List */}
        {!loading && !error && (
          <div className="bookings-list">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking, index) => {
                const chatMeta = chatMetaByBooking[booking.id];
                const unreadCount = chatMeta?.unreadCount || 0;
                const lastMessageText = chatMeta?.lastMessage?.text || '';

                return (
                <div 
                  key={booking.id} 
                  className={`booking-card ${expandedBooking === booking.id ? 'expanded' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="booking-card-header">
                    <div className="booking-id">
                      <span className="id-label">Booking ID:</span>
                      <span className="id-value">{booking.bookingId || booking.id.slice(-6).toUpperCase()}</span>
                    </div>
                    <div className="booking-actions">
                      {booking.status === 'pending' && (
                        <>
                          <button 
                            className="action-btn cancel"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowCancelModal(true);
                            }}
                          >
                            Cancel
                          </button>
                          <button 
                            className="action-btn reschedule"
                            onClick={() => handleReschedule(booking)}
                          >
                            Reschedule
                          </button>
                        </>
                      )}
                      <button
                        className="action-btn contact"
                        onClick={() => handleOpenChat(booking)}
                      >
                        Chat
                        {unreadCount > 0 && <span className="chat-unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
                      </button>
                      {['accepted', 'in-progress'].includes(booking.status) && booking.professionalUserId && (
                        <button
                          className="action-btn reschedule"
                          onClick={() => handleShareMyLocationToChat(booking)}
                          disabled={Boolean(shareLocationLoadingByBooking[booking.id])}
                        >
                          {shareLocationLoadingByBooking[booking.id] ? 'Sharing...' : 'Share Booking Address'}
                        </button>
                      )}
                      {booking.status === 'completed' && !booking.rating && (
                        <button 
                          className="action-btn review"
                          onClick={() => handleAddReview(booking)}
                        >
                          Add Review
                        </button>
                      )}
                      <button 
                        className="action-btn details"
                        onClick={() => handleViewDetails(booking)}
                      >
                        Details
                      </button>
                      <button 
                        className="expand-btn"
                        onClick={() => setExpandedBooking(expandedBooking === booking.id ? null : booking.id)}
                        title="Expand/collapse booking details"
                        aria-label="Expand booking details"
                      >
                        <svg className={`expand-icon ${expandedBooking === booking.id ? 'rotated' : ''}`} viewBox="0 0 24 24" width="20" height="20">
                          <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="booking-card-body">
                    <div className="service-info">
                      <div className="service-icon-wrapper">
                        <span className="service-icon">{booking.serviceIcon}</span>
                      </div>
                      <div className="service-details">
                        <h3 className="service-name">{booking.serviceName}</h3>
                        <button
                          type="button"
                          className="professional-chat-trigger"
                          onClick={() => handleOpenChat(booking)}
                          title="Open chat"
                        >
                          <img src={booking.professionalImage} alt={booking.professionalName} className="professional-image" onError={(e) => e.target.src = 'https://randomuser.me/api/portraits/men/1.jpg'} />
                          <span className="professional-name">{booking.professionalName}</span>
                          {unreadCount > 0 && <span className="chat-unread-dot" aria-label={`${unreadCount} unread messages`} />}
                        </button>
                        {lastMessageText && <p className="chat-preview-text">{lastMessageText}</p>}
                      </div>
                    </div>

                    <div className="booking-meta">
                      <div className="meta-item">
                        <svg className="meta-icon" viewBox="0 0 24 24">
                          <path d="M8 7V3M16 7V3M3 11H21M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z"/>
                        </svg>
                        <span>{formatDate(booking.date)}</span>
                      </div>
                      <div className="meta-item">
                        <svg className="meta-icon" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span>{booking.time}</span>
                      </div>
                      <div className="meta-item">
                        <svg className="meta-icon" viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                          <circle cx="12" cy="9" r="2.5"/>
                        </svg>
                        <span>{(booking.address || '').substring(0, 30)}...</span>
                      </div>
                      <div className="meta-item">
                        <svg className="meta-icon" viewBox="0 0 24 24">
                          <path d="M12 2v20M2 12h20"/>
                        </svg>
                        <span>{formatPrice(booking.finalAmount || booking.price, booking.currency)}</span>
                      </div>
                    </div>

                    {['accepted', 'in-progress'].includes(booking.status) && (
                      <div className="booking-live-location">
                        {liveLocationByBooking[booking.id]?.isSharing &&
                        liveLocationByBooking[booking.id]?.currentLocation?.latitude !== null &&
                        liveLocationByBooking[booking.id]?.currentLocation?.longitude !== null ? (
                          <>
                            <div className="booking-live-location-title">📡 Professional live location is active</div>
                            <div className="booking-live-location-meta">
                              <span>
                                Updated {formatLiveLocationAge(liveLocationByBooking[booking.id]?.currentLocation?.updatedAt)}
                              </span>
                              <a
                                href={getMapLink(
                                  liveLocationByBooking[booking.id]?.currentLocation?.latitude,
                                  liveLocationByBooking[booking.id]?.currentLocation?.longitude
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View on map
                              </a>
                            </div>
                          </>
                        ) : (
                          <div className="booking-live-location-waiting">
                            📍 Waiting for professional to start live location sharing.
                          </div>
                        )}
                      </div>
                    )}

                    <div className="booking-status">
                      {booking.status === 'completed' ? (
                        <span className="status-badge completed">
                          ✓ Completed
                        </span>
                      ) : (booking.status === 'pending' || booking.status === 'accepted' || booking.status === 'in-progress') ? (
                        <span className="status-badge pending">
                          ⏳ Pending
                        </span>
                      ) : booking.status === 'cancelled' || booking.status === 'rejected' ? (
                        <span className="status-badge cancelled">
                          ✕ {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {expandedBooking === booking.id && (
                    <div className="booking-card-expanded">
                      <div className="expanded-section">
                        <h4>Booking Details</h4>
                        <div className="details-grid">
                          <div className="detail-item">
                            <span className="detail-label">Duration:</span>
                            <span className="detail-value">{booking.duration}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Payment Method:</span>
                            <span className="detail-value">{booking.paymentMethod}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Special Instructions:</span>
                            <span className="detail-value">{booking.specialInstructions || 'None'}</span>
                          </div>
                        </div>
                      </div>

                      {booking.rating && (
                        <div className="expanded-section">
                          <h4>Your Review</h4>
                          <div className="review-display">
                            <div className="rating-stars">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={`star ${i < booking.rating ? 'filled' : ''}`}>★</span>
                              ))}
                            </div>
                            <p className="review-text">"{booking.review}"</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                );
              })
            ) : (
              <div className="no-bookings">
                <div className="no-bookings-icon">📭</div>
                <h3>No bookings found</h3>
                <p>Try adjusting your filters or book a new service</p>
                <button className="book-now-btn" onClick={() => navigate('/services')}>Book a Service</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Email Lookup Modal */}
      {showEmailModal && (
        <div className="modal-overlay">
          <div className="modal-content email-modal">
            <button className="modal-close" onClick={() => setShowEmailModal(false)}>×</button>
            
            <div className="modal-header">
              <h2>Find Your Bookings</h2>
            </div>

            <div className="modal-body">
              <p className="email-instructions">
                Please enter the email address you used while booking to view your bookings.
              </p>
              
              <form onSubmit={handleEmailSubmit}>
                <div className="form-group">
                  <label htmlFor="lookupEmail">Email Address</label>
                  <input
                    type="email"
                    id="lookupEmail"
                    value={lookupEmail}
                    onChange={(e) => setLookupEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="form-input"
                  />
                </div>

                <button type="submit" className="modal-btn primary" disabled={loading}>
                  {loading ? 'Searching...' : 'Find My Bookings'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)} id="details-modal-overlay">
          <div className="modal-content booking-details-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowDetailsModal(false)}>×</button>
            
            <div className="modal-header">
              <h2>Booking Details</h2>
              <span className={getStatusBadgeClass(selectedBooking.status)}>
                {selectedBooking.status}
              </span>
            </div>

            <div className="modal-body">
              <div className="details-section">
                <h3>Service Information</h3>
                <div className="details-row">
                  <span className="details-label">Booking ID:</span>
                  <span className="details-value">{selectedBooking.bookingId || selectedBooking.id.slice(-6).toUpperCase()}</span>
                </div>
                <div className="details-row">
                  <span className="details-label">Service:</span>
                  <span className="details-value">{selectedBooking.serviceName}</span>
                </div>
                <div className="details-row">
                  <span className="details-label">Professional:</span>
                  <span className="details-value">{selectedBooking.professionalName}</span>
                </div>
                <div className="details-row">
                  <span className="details-label">Date & Time:</span>
                  <span className="details-value">{formatDate(selectedBooking.date)} at {selectedBooking.time}</span>
                </div>
                <div className="details-row">
                  <span className="details-label">Duration:</span>
                  <span className="details-value">{selectedBooking.duration}</span>
                </div>
              </div>

              <div className="details-section">
                <h3>Location</h3>
                <div className="details-row">
                  <span className="details-label">Address:</span>
                  <span className="details-value">{selectedBooking.address || 'Not specified'}</span>
                </div>
                {['accepted', 'in-progress'].includes(selectedBooking.status) && (
                  <>
                    <div className="details-row">
                      <span className="details-label">Live Tracking:</span>
                      <span className="details-value">
                        {liveLocationByBooking[selectedBooking.id]?.isSharing ? 'Active' : 'Not active yet'}
                      </span>
                    </div>
                    {liveLocationByBooking[selectedBooking.id]?.isSharing &&
                      liveLocationByBooking[selectedBooking.id]?.currentLocation?.latitude !== null &&
                      liveLocationByBooking[selectedBooking.id]?.currentLocation?.longitude !== null && (
                      <div className="details-row">
                        <span className="details-label">Live Map:</span>
                        <span className="details-value">
                          <a
                            href={getMapLink(
                              liveLocationByBooking[selectedBooking.id]?.currentLocation?.latitude,
                              liveLocationByBooking[selectedBooking.id]?.currentLocation?.longitude
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open current location
                          </a>
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="details-section">
                <h3>Payment Details</h3>
                <div className="details-row">
                  <span className="details-label">Subtotal:</span>
                  <span className="details-value">{formatPrice(selectedBooking.totalAmount, selectedBooking.currency)}</span>
                </div>
                <div className="details-row">
                  <span className="details-label">Discount:</span>
                  <span className="details-value">-{formatPrice(selectedBooking.discount, selectedBooking.currency)}</span>
                </div>
                <div className="details-row">
                  <span className="details-label">Tax:</span>
                  <span className="details-value">+{formatPrice(selectedBooking.tax, selectedBooking.currency)}</span>
                </div>
                <div className="details-row total">
                  <span className="details-label">Total Amount:</span>
                  <span className="details-value">{formatPrice(selectedBooking.finalAmount, selectedBooking.currency)}</span>
                </div>
                <div className="details-row">
                  <span className="details-label">Payment Method:</span>
                  <span className="details-value">{selectedBooking.paymentMethod}</span>
                </div>
                <div className="details-row">
                  <span className="details-label">Payment Status:</span>
                  <span className={getPaymentStatusBadge(selectedBooking.paymentStatus)}>
                    {selectedBooking.paymentStatus}
                  </span>
                </div>
              </div>

              {selectedBooking.specialInstructions && (
                <div className="details-section">
                  <h3>Special Instructions</h3>
                  <p className="instructions-text">{selectedBooking.specialInstructions}</p>
                </div>
              )}

              {selectedBooking.rating && (
                <div className="details-section">
                  <h3>Your Review</h3>
                  <div className="rating-stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`star ${i < selectedBooking.rating ? 'filled' : ''}`}>★</span>
                    ))}
                  </div>
                  <p className="review-text">{selectedBooking.review}</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                className="modal-btn primary" 
                onClick={() => {
                  const originalTitle = document.title;
                  document.title = `Invoice-${selectedBooking.bookingId}`;
                  window.print();
                  document.title = originalTitle;
                }}
              >
                Download Invoice
              </button>
              <button className="modal-btn secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content cancel-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCancelModal(false)}>×</button>
            
            <div className="modal-header">
              <h2>Cancel Booking</h2>
            </div>

            <div className="modal-body">
              <p className="cancel-warning">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              
              <div className="form-group">
                <label htmlFor="cancelReason">Reason for cancellation (optional)</label>
                <textarea
                  id="cancelReason"
                  rows="4"
                  placeholder="Please tell us why you're cancelling..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                ></textarea>
              </div>

              <div className="booking-summary">
                <h4>Booking Summary</h4>
                <div className="summary-item">
                  <span>Service:</span>
                  <span>{selectedBooking.serviceName}</span>
                </div>
                <div className="summary-item">
                  <span>Date:</span>
                  <span>{formatDate(selectedBooking.date)}</span>
                </div>
                <div className="summary-item">
                  <span>Amount:</span>
                  <span>{formatPrice(selectedBooking.finalAmount, selectedBooking.currency)}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="modal-btn cancel-btn"
                onClick={() => handleCancelBooking(selectedBooking.id)}
              >
                Confirm Cancellation
              </button>
              <button 
                className="modal-btn secondary"
                onClick={() => setShowCancelModal(false)}
              >
                Keep Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedBooking && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowRescheduleModal(false); }}>
          <div className="modal-content reschedule-modal">
            <button className="modal-close" onClick={() => setShowRescheduleModal(false)}>×</button>

            <div className="modal-header">
              <h2>Reschedule Booking</h2>
            </div>

            <div className="modal-body">
              <div className="booking-summary" style={{ marginBottom: '1.2rem' }}>
                <div className="summary-item">
                  <span>Service:</span>
                  <span>{selectedBooking.serviceName}</span>
                </div>
                <div className="summary-item">
                  <span>Current Date:</span>
                  <span>{formatDate(selectedBooking.date)} at {selectedBooking.time}</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="rescheduleDate">New Date</label>
                <input
                  type="date"
                  id="rescheduleDate"
                  className="form-input"
                  value={rescheduleData.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="rescheduleTime">New Time</label>
                <select
                  id="rescheduleTime"
                  className="form-input"
                  value={rescheduleData.time}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, time: e.target.value }))}
                  required
                >
                  <option value="">— Select time —</option>
                  <option value="07:00">7:00 AM</option>
                  <option value="08:00">8:00 AM</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                  <option value="18:00">6:00 PM</option>
                  <option value="19:00">7:00 PM</option>
                  <option value="20:00">8:00 PM</option>
                </select>
              </div>

              {rescheduleError && (
                <div className="error-state" style={{ padding: '0.75rem 1rem', marginTop: '0.5rem', borderRadius: '8px' }}>
                  <p style={{ margin: 0 }}>⚠ {rescheduleError}</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="modal-btn primary"
                onClick={submitReschedule}
                disabled={isRescheduling}
              >
                {isRescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
              </button>
              <button className="modal-btn secondary" onClick={() => setShowRescheduleModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedBookingForReview && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content review-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowReviewModal(false)}>×</button>
            
            <div className="modal-header">
              <h2>Rate Your Experience</h2>
            </div>

            <div className="modal-body">
              <div className="professional-info">
                <img src={selectedBookingForReview.professionalImage} alt={selectedBookingForReview.professionalName} onError={(e) => e.target.src = 'https://randomuser.me/api/portraits/men/1.jpg'} />
                <div>
                  <h3>{selectedBookingForReview.professionalName}</h3>
                  <p>{selectedBookingForReview.serviceName}</p>
                </div>
              </div>

              <div className="rating-input">
                <label>Your Rating</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${(rating[selectedBookingForReview.id] || 0) >= star ? 'filled' : ''}`}
                      onClick={() => setRating({ ...rating, [selectedBookingForReview.id]: star })}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="review">Write your review</label>
                <textarea
                  id="review"
                  rows="5"
                  placeholder="Share your experience with this professional..."
                  value={review[selectedBookingForReview.id] || ''}
                  onChange={(e) => setReview({ ...review, [selectedBookingForReview.id]: e.target.value })}
                ></textarea>
              </div>
            </div>

            <div className="modal-footer">
              <button className="modal-btn primary" onClick={submitReview}>
                Submit Review
              </button>
              <button className="modal-btn secondary" onClick={() => setShowReviewModal(false)}>
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBooking;
