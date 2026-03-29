const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const ChatThread = require('../models/ChatThread');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Maps a professional's profession to the matching booking service type
const professionToServiceType = {
  'Plumber': 'Plumbing',
  'Electrician': 'Electrical',
  'Carpenter': 'Carpentry',
  'Cleaner': 'Cleaning',
  'Painter': 'Painting',
  'HVAC Technician': 'HVAC',
  'Moving Specialist': 'Moving',
  'Gardener': 'Gardening',
  'Tutor': 'Tutoring',
  'Handyman': 'Handyman'
};

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to access this route' 
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'karyon_secret_key');
      req.user = await User.findById(decoded.id);
      next();
    } catch (err) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token is invalid or expired' 
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getBookingRoomName = (bookingId) => `booking:${bookingId}`;

const parseOptionalAuthUser = async (req) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'karyon_secret_key');
    const user = await User.findById(decoded.id);
    return user || null;
  } catch {
    return null;
  }
};

const canAccessBooking = (booking, user) => {
  if (!booking || !user) return false;
  if (user.isAdmin) return true;

  const isOwner = booking.customer?.userId && booking.customer.userId.toString() === user._id.toString();
  const isAssignedProfessional = booking.professional?.userId && booking.professional.userId.toString() === user._id.toString();

  return Boolean(isOwner || isAssignedProfessional);
};

const toNullableNumber = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const getBookingAddressMapLink = (booking) => {
  const parts = [
    booking?.address?.street,
    booking?.address?.city,
    booking?.address?.zipCode
  ].filter(Boolean);

  if (!parts.length) return '';

  return `https://www.google.com/maps?q=${encodeURIComponent(parts.join(', '))}`;
};

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Public (no auth required for now to allow quick bookings)
router.post('/', async (req, res) => {
  try {
    const { 
      customer, 
      service, 
      schedule, 
      address, 
      pricing,
      payment 
    } = req.body;

    // Validate required fields
    if (!customer || !customer.name || !customer.email || !customer.phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide customer details (name, email, phone)' 
      });
    }

    if (!service || !service.type || !service.name || !service.description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide service details (type, name, description)' 
      });
    }

    if (!schedule || !schedule.date || !schedule.time) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide schedule (date, time)' 
      });
    }

    if (!address || !address.street) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide address' 
      });
    }

    // Check if user is logged in and get their ID
    let userId = null;
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'karyon_secret_key');
        userId = decoded.id;
      } catch (err) {
        // User not authenticated, continue without userId
      }
    }

    // Create booking
    const booking = new Booking({
      customer: {
        name: customer.name,
        email: customer.email.toLowerCase(),
        phone: customer.phone,
        userId: userId
      },
      service: {
        type: service.type,
        name: service.name,
        description: service.description,
        subService: service.subService || ''
      },
      schedule: {
        date: schedule.date,
        time: schedule.time,
        isEmergency: schedule.isEmergency || false
      },
      address: {
        street: address.street,
        city: address.city || '',
        zipCode: address.zipCode || ''
      },
      pricing: {
        basePrice: pricing?.basePrice || 0,
        additionalCharges: pricing?.additionalCharges || 0,
        totalPrice: pricing?.totalPrice || 0,
        currency: pricing?.currency || 'INR'
      },
      payment: {
        method: payment?.method || 'cash',
        status: 'pending'
      }
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        id: booking._id,
        customer: booking.customer,
        service: booking.service,
        schedule: booking.schedule,
        address: booking.address,
        status: booking.status,
        pricing: booking.pricing,
        createdAt: booking.createdAt
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error creating booking' 
    });
  }
});

// @route   GET /api/bookings
// @desc    Get all bookings for a user (authenticated) or by email (guest)
// @access  Private (or public with email)
router.get('/', async (req, res) => {
  try {
    const { email, page = 1, limit = 10 } = req.query;
    
    // Check for auth token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    let query = {};
    
    // If authenticated, get bookings by userId
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'karyon_secret_key');
        const user = await User.findById(decoded.id);
        if (user) {
          query = { 'customer.userId': user._id };
        }
      } catch (err) {
        // Token invalid, check for email
        if (email) {
          query = { 'customer.email': email.toLowerCase() };
        } else {
          return res.status(401).json({ 
            success: false, 
            message: 'Please provide email to view bookings' 
          });
        }
      }
    } else if (email) {
      // Guest user - lookup by email
      query = { 'customer.email': email.toLowerCase() };
    } else {
      return res.status(401).json({ 
        success: false, 
        message: 'Please login or provide email to view bookings' 
      });
    }

    const { status } = req.query;
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      bookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching bookings' 
    });
  }
});

// @route   GET /api/bookings/guest
// @desc    Get bookings by email (for guest users)
// @access  Public
router.get('/guest', async (req, res) => {
  try {
    const { email, phone } = req.query;
    
    if (!email && !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email or phone number' 
      });
    }

    let query = {};
    if (email) {
      query['customer.email'] = email.toLowerCase();
    }
    if (phone) {
      query['customer.phone'] = phone;
    }

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Get guest bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching bookings' 
    });
  }
});

// @route   GET /api/bookings/all
// @desc    Get all bookings (for admin/professionals)
// @access  Private (Admin/Professional)
router.get('/all', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    // If user is a professional, show bookings for their mapped service type
    if (req.user.userType === 'professional') {
      const serviceType = professionToServiceType[req.user.profession];
      if (!serviceType) {
        return res.status(400).json({ success: false, message: 'No service type mapped for your profession' });
      }
      query['service.type'] = serviceType;
    }
    
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      bookings
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching bookings' 
    });
  }
});

// @route   GET /api/bookings/available
// @desc    Get available (pending) bookings for a professional matching their service type
// @access  Private (Professional)
router.get('/available', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'professional') {
      return res.status(403).json({ success: false, message: 'Access denied. Professionals only.' });
    }

    const serviceType = professionToServiceType[req.user.profession];
    if (!serviceType) {
      return res.status(400).json({ success: false, message: 'No service type mapped for your profession' });
    }

    const bookings = await Booking.find({
      'service.type': serviceType,
      status: 'pending',
      'professional.userId': { $exists: false }   // not yet claimed
    }).sort({ 'schedule.date': 1, createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error('Get available bookings error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching available bookings' });
  }
});

// @route   GET /api/bookings/home-stats
// @desc    Get public aggregate stats for home page
// @access  Public
router.get('/home-stats', async (req, res) => {
  try {
    const [
      registeredCustomers,
      totalProfessionals,
      completedServices,
      bookingCustomerEmails,
      bookingCities,
      userCities
    ] = await Promise.all([
      User.countDocuments({ userType: 'customer' }),
      User.countDocuments({ userType: 'professional' }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.distinct('customer.email', { 'customer.email': { $exists: true, $ne: '' } }),
      Booking.distinct('address.city', { 'address.city': { $exists: true, $ne: '' } }),
      User.distinct('address.city', { 'address.city': { $exists: true, $ne: '' } })
    ]);

    const uniqueBookingCustomers = new Set(
      bookingCustomerEmails
        .map((email) => String(email).trim().toLowerCase())
        .filter(Boolean)
    ).size;

    const uniqueCities = new Set(
      [...bookingCities, ...userCities]
        .map((city) => String(city).trim().toLowerCase())
        .filter(Boolean)
    ).size;

    res.json({
      success: true,
      stats: {
        customers: Math.max(registeredCustomers, uniqueBookingCustomers),
        professionals: totalProfessionals,
        services: completedServices,
        cities: uniqueCities
      }
    });
  } catch (error) {
    console.error('Get home stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching home statistics'
    });
  }
});

// @route   GET /api/bookings/:id/location
// @desc    Get current professional live location for a booking
// @access  Private for booking participants, or guest with customer email
router.get('/:id/location', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const user = await parseOptionalAuthUser(req);
    const { email } = req.query;
    const hasGuestAccess = Boolean(email && booking.customer?.email === String(email).toLowerCase());

    if (!canAccessBooking(booking, user) && !hasGuestAccess) {
      return res.status(403).json({ success: false, message: 'Not authorized to view live location for this booking' });
    }

    return res.json({
      success: true,
      tracking: booking.tracking || { isSharing: false, currentLocation: null }
    });
  } catch (error) {
    console.error('Get booking location error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching live location' });
  }
});

// @route   PUT /api/bookings/:id/location
// @desc    Update current professional location for a booking
// @access  Private (Assigned professional only)
router.put('/:id/location', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'professional' && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Only professionals can share live location' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isAssigned = booking.professional?.userId &&
      booking.professional.userId.toString() === req.user._id.toString();
    if (!isAssigned && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this booking' });
    }

    if (!['accepted', 'in-progress'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `Cannot share location for booking status "${booking.status}"` });
    }

    const latitude = toNullableNumber(req.body.latitude);
    const longitude = toNullableNumber(req.body.longitude);
    const accuracy = toNullableNumber(req.body.accuracy);
    const heading = toNullableNumber(req.body.heading);
    const speed = toNullableNumber(req.body.speed);

    if (latitude === null || longitude === null) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ success: false, message: 'Invalid latitude/longitude values' });
    }

    booking.tracking = booking.tracking || {};
    booking.tracking.isSharing = true;
    booking.tracking.currentLocation = {
      latitude,
      longitude,
      accuracy,
      heading,
      speed,
      updatedAt: new Date()
    };

    await booking.save();

    const io = req.app.get('io');
    if (io) {
      io.to(getBookingRoomName(String(booking._id))).emit('location_update', {
        bookingId: String(booking._id),
        tracking: booking.tracking,
        professional: {
          name: booking.professional?.name || req.user.name
        }
      });
    }

    return res.json({ success: true, message: 'Live location updated', tracking: booking.tracking });
  } catch (error) {
    console.error('Update booking location error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating live location' });
  }
});

// @route   PUT /api/bookings/:id/location/stop
// @desc    Stop professional live location sharing for a booking
// @access  Private (Assigned professional only)
router.put('/:id/location/stop', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'professional' && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Only professionals can stop live location sharing' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isAssigned = booking.professional?.userId &&
      booking.professional.userId.toString() === req.user._id.toString();
    if (!isAssigned && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this booking' });
    }

    booking.tracking = booking.tracking || {};
    booking.tracking.isSharing = false;
    await booking.save();

    const io = req.app.get('io');
    if (io) {
      io.to(getBookingRoomName(String(booking._id))).emit('location_update', {
        bookingId: String(booking._id),
        tracking: booking.tracking,
        professional: {
          name: booking.professional?.name || req.user.name
        }
      });
    }

    return res.json({ success: true, message: 'Live location sharing stopped', tracking: booking.tracking });
  } catch (error) {
    console.error('Stop booking location error:', error);
    return res.status(500).json({ success: false, message: 'Server error stopping live location sharing' });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking by ID
// @access  Private or Public (with email verification)
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Check for auth token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // If authenticated, check ownership
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'karyon_secret_key');
        const user = await User.findById(decoded.id);
        
        if (user) {
          const isOwner = booking.customer.userId && 
            booking.customer.userId.toString() === user._id.toString();
          const isProfessional = user.userType === 'professional';
          
          if (isOwner || isProfessional || user.isAdmin) {
            return res.json({
              success: true,
              booking
            });
          }
        }
      } catch (err) {
        // Token invalid, check email
      }
    }

    // For guest access, require email in query
    const { email } = req.query;
    if (email && booking.customer.email === email.toLowerCase()) {
      return res.json({
        success: true,
        booking
      });
    }

    // Check if it's a guest booking without userId - allow access with email
    if (!booking.customer.userId && email && booking.customer.email === email.toLowerCase()) {
      return res.json({
        success: true,
        booking
      });
    }

    // Check if booking has no userId (guest booking) - allow with email
    if (!booking.customer.userId) {
      if (email && booking.customer.email === email.toLowerCase()) {
        return res.json({
          success: true,
          booking
        });
      }
      return res.status(403).json({ 
        success: false, 
        message: 'Please provide the email used during booking to view details' 
      });
    }

    res.status(403).json({ 
      success: false, 
      message: 'Not authorized to view this booking' 
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching booking' 
    });
  }
});

// @route   PUT /api/bookings/:id
// @desc    Update a booking
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Check if user owns the booking
    const isOwner = booking.customer.userId && 
      booking.customer.userId.toString() === req.user._id.toString();
    const isProfessional = req.user.userType === 'professional';
    const isAdmin = req.user.isAdmin;

    if (!isOwner && !isProfessional && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this booking' 
      });
    }

    const { 
      service, 
      schedule, 
      address, 
      pricing,
      status 
    } = req.body;

    // Update fields
    if (service) {
      booking.service = { ...booking.service.toObject(), ...service };
    }
    if (schedule) {
      booking.schedule = { ...booking.schedule.toObject(), ...schedule };
    }
    if (address) {
      booking.address = { ...booking.address.toObject(), ...address };
    }
    if (pricing) {
      booking.pricing = { ...booking.pricing.toObject(), ...pricing };
    }
    if (status && (isProfessional || isAdmin)) {
      booking.status = status;
      if (status === 'completed') {
        booking.completedAt = Date.now();
      }
    }

    await booking.save();

    res.json({
      success: true,
      message: 'Booking updated successfully',
      booking
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating booking' 
    });
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private
router.put('/:id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Check for auth token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    let isAuthorized = false;

    // If authenticated, check ownership
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'karyon_secret_key');
        const user = await User.findById(decoded.id);
        
        if (user) {
          const isOwner = booking.customer.userId && 
            booking.customer.userId.toString() === user._id.toString();
          const isProfessional = user.userType === 'professional';
          const isAdmin = user.isAdmin;
          
          if (isOwner || isProfessional || isAdmin) {
            isAuthorized = true;
          }
        }
      } catch (err) {
        // Token invalid
      }
    }

    // For guest booking, allow cancellation with email verification
    if (!isAuthorized && !booking.customer.userId) {
      const { email } = req.body;
      if (email && booking.customer.email === email.toLowerCase()) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to cancel this booking' 
      });
    }

    // Can't cancel completed bookings
    if (booking.status === 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot cancel a completed booking' 
      });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = Date.now();
    booking.cancellationReason = req.body.reason || 'Cancelled by user';
    if (!booking.tracking) {
      booking.tracking = {};
    }
    booking.tracking.isSharing = false;

    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error cancelling booking' 
    });
  }
});

// @route   PUT /api/bookings/:id/reschedule
// @desc    Reschedule a booking (change date/time)
// @access  Public (auth or guest email)
router.put('/:id/reschedule', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Can't reschedule cancelled or completed bookings
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot reschedule a ${booking.status} booking`
      });
    }

    const { date, time, email } = req.body;

    if (!date || !time) {
      return res.status(400).json({ success: false, message: 'Please provide new date and time' });
    }

    // Validate date is not in the past
    const pickedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (pickedDate < today) {
      return res.status(400).json({ success: false, message: 'Please select a present or future date' });
    }

    // Authorisation: token or guest email
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    let isAuthorized = false;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'karyon_secret_key');
        const user = await User.findById(decoded.id);
        if (user) {
          const isOwner = booking.customer.userId &&
            booking.customer.userId.toString() === user._id.toString();
          if (isOwner || user.isAdmin) isAuthorized = true;
        }
      } catch (err) { /* invalid token */ }
    }

    // Guest: authenticate with the booking email
    if (!isAuthorized) {
      if (email && booking.customer.email === email.toLowerCase()) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Not authorized to reschedule this booking' });
    }

    booking.schedule.date = date;
    booking.schedule.time = time;
    // Reset to pending so admin/professional can re-confirm
    if (booking.status === 'accepted') booking.status = 'pending';

    await booking.save();

    res.json({
      success: true,
      message: 'Booking rescheduled successfully',
      booking
    });
  } catch (error) {
    console.error('Reschedule booking error:', error);
    res.status(500).json({ success: false, message: 'Server error rescheduling booking' });
  }
});

// @route   PUT /api/bookings/:id/accept
// @desc    Accept a booking (Professional)
// @access  Private (Professional)
router.put('/:id/accept', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'professional') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only professionals can accept bookings' 
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Booking is not available for acceptance' 
      });
    }

    // Check if the professional's mapped service type matches this booking
    const serviceType = professionToServiceType[req.user.profession];
    if (!serviceType) {
      return res.status(400).json({
        success: false,
        message: 'No service type mapped for your profession'
      });
    }

    if (serviceType !== booking.service.type) {
      return res.status(400).json({ 
        success: false, 
        message: 'This booking is for a different service type' 
      });
    }

    booking.status = 'accepted';
    booking.professional = {
      userId: req.user._id,
      name: req.user.name,
      phone: req.user.phone,
      profession: req.user.profession,
      assignedAt: Date.now()
    };
    booking.acceptedAt = Date.now();

    await booking.save();

    await ChatThread.findOneAndUpdate(
      { bookingId: booking._id },
      {
        $setOnInsert: {
          bookingId: booking._id,
          messages: []
        },
        $set: {
          customerId: booking.customer?.userId || null,
          professionalId: booking.professional?.userId || null
        }
      },
      { upsert: true }
    );

    // Share the customer filled service address with professional through chat once.
    if (!booking.customerAddressSharedAt) {
      const thread = await ChatThread.findOne({ bookingId: booking._id });
      const mapLink = getBookingAddressMapLink(booking);
      const canSendAddressMessage = Boolean(thread && mapLink && booking.customer?.userId);

      if (canSendAddressMessage) {
        const text = `📍 Customer service address: ${mapLink}`;
        const message = {
          sender: {
            userId: booking.customer.userId,
            name: booking.customer.name || 'Customer',
            userType: 'customer'
          },
          text,
          sentAt: new Date()
        };

        thread.messages.push(message);
        thread.lastMessage = {
          text,
          senderId: booking.customer.userId,
          sentAt: message.sentAt
        };

        thread.unreadCounts = {
          customer: thread.unreadCounts?.customer || 0,
          professional: (thread.unreadCounts?.professional || 0) + 1,
          admin: thread.unreadCounts?.admin || 0
        };

        await thread.save();

        booking.customerAddressSharedAt = new Date();
        await booking.save();

        const io = req.app.get('io');
        if (io) {
          io.to(`booking:${String(booking._id)}`).emit('new_message', {
            bookingId: String(booking._id),
            message: thread.messages[thread.messages.length - 1],
            unreadCounts: thread.unreadCounts
          });
        }
      }
    }

    res.json({
      success: true,
      message: 'Booking accepted successfully',
      booking
    });
  } catch (error) {
    console.error('Accept booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error accepting booking' 
    });
  }
});

// @route   PUT /api/bookings/:id/start
// @desc    Move an accepted booking to in-progress (Professional)
// @access  Private (Professional)
router.put('/:id/start', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (req.user.userType !== 'professional') {
      return res.status(403).json({ success: false, message: 'Only professionals can start jobs' });
    }

    const isAssigned = booking.professional?.userId &&
      booking.professional.userId.toString() === req.user._id.toString();
    if (!isAssigned && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this booking' });
    }

    if (booking.status !== 'accepted') {
      return res.status(400).json({ success: false, message: `Only accepted bookings can be started. Current status is "${booking.status}"` });
    }

    booking.status = 'in-progress';
    await booking.save();

    res.json({ success: true, message: 'Job started successfully', booking });
  } catch (error) {
    console.error('Start booking error:', error);
    res.status(500).json({ success: false, message: 'Server error starting booking' });
  }
});

// @route   PUT /api/bookings/:id/review
// @desc    Add review to a completed booking
// @access  Private
router.put('/:id/review', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Check for auth token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    let isAuthorized = false;

    // If authenticated, check ownership
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'karyon_secret_key');
        const user = await User.findById(decoded.id);
        
        if (user) {
          const isOwner = booking.customer.userId && 
            booking.customer.userId.toString() === user._id.toString();
          
          if (isOwner) {
            isAuthorized = true;
          }
        }
      } catch (err) {
        // Token invalid
      }
    }

    // For guest booking, allow review with email verification
    if (!isAuthorized && !booking.customer.userId) {
      const { email } = req.body;
      if (email && booking.customer.email === email.toLowerCase()) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to review this booking' 
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Can only review completed bookings' 
      });
    }

    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid rating (1-5)' 
      });
    }

    booking.review = {
      rating,
      comment: comment || '',
      reviewedAt: Date.now()
    };

    await booking.save();

    res.json({
      success: true,
      message: 'Review added successfully',
      booking
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error adding review' 
    });
  }
});

// @route   GET /api/bookings/stats/user
// @desc    Get booking statistics for user
// @access  Private
router.get('/stats/user', auth, async (req, res) => {
  try {
    const stats = await Booking.aggregate([
      { $match: { 'customer.userId': req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalSpent = await Booking.aggregate([
      { $match: { 'customer.userId': req.user._id, status: 'completed' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$pricing.totalPrice' }
        }
      }
    ]);

    const result = {
      pending: 0,
      accepted: 0,
      completed: 0,
      cancelled: 0,
      totalSpent: totalSpent[0]?.total || 0
    };

    stats.forEach(stat => {
      result[stat._id] = stat.count;
    });

    res.json({
      success: true,
      stats: result
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching statistics' 
    });
  }
});

// @route   PUT /api/bookings/:id/complete
// @desc    Mark a booking as completed (Professional)
// @access  Private (Professional)
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (req.user.userType !== 'professional') {
      return res.status(403).json({ success: false, message: 'Only professionals can complete bookings' });
    }

    const isAssigned = booking.professional?.userId &&
      booking.professional.userId.toString() === req.user._id.toString();
    if (!isAssigned && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this booking' });
    }

    if (!['accepted', 'in-progress'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `Cannot complete a booking with status "${booking.status}"` });
    }

    const { finalPrice } = req.body;
    booking.status = 'completed';
    booking.completedAt = Date.now();
    booking.tracking = booking.tracking || {};
    booking.tracking.isSharing = false;
    if (finalPrice) {
      booking.pricing.totalPrice = finalPrice;
      booking.pricing.basePrice = finalPrice;
    }

    await booking.save();
    res.json({ success: true, message: 'Booking marked as completed', booking });
  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(500).json({ success: false, message: 'Server error completing booking' });
  }
});

// @route   PUT /api/bookings/:id/reject
// @desc    Professional rejects / declines a booking
// @access  Private (Professional)
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (req.user.userType !== 'professional') {
      return res.status(403).json({ success: false, message: 'Only professionals can reject bookings' });
    }

    if (!['pending', 'accepted'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `Cannot reject a booking with status "${booking.status}"` });
    }

    // If rejecting an accepted booking, clear the professional assignment so it becomes available again
    if (booking.status === 'accepted' &&
        booking.professional?.userId?.toString() === req.user._id.toString()) {
      booking.professional = undefined;
      booking.status = 'pending';
      booking.tracking = booking.tracking || {};
      booking.tracking.isSharing = false;
    } else {
      booking.status = 'rejected';
      booking.tracking = booking.tracking || {};
      booking.tracking.isSharing = false;
    }

    booking.cancellationReason = req.body.reason || 'Declined by professional';
    await booking.save();
    res.json({ success: true, message: 'Booking rejected', booking });
  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({ success: false, message: 'Server error rejecting booking' });
  }
});

// @route   GET /api/bookings/professional/jobs
// @desc    Get all jobs for the logged-in professional (active + history)
// @access  Private (Professional)
router.get('/professional/jobs', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'professional') {
      return res.status(403).json({ success: false, message: 'Access denied. Professionals only.' });
    }

    const myJobs = await Booking.find({
      'professional.userId': req.user._id
    }).sort({ createdAt: -1 });

    res.json({ success: true, count: myJobs.length, bookings: myJobs });
  } catch (error) {
    console.error('Get professional jobs error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching your jobs' });
  }
});

module.exports = router;
