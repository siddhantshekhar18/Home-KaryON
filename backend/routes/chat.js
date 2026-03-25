const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const Booking = require('../models/Booking');
const User = require('../models/User');
const mongoose = require('mongoose');
const ChatThread = require('../models/ChatThread');

const auth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'karyon_secret_key');
      req.user = await User.findById(decoded.id);
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Token is invalid or expired' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getBookingAccessRole = (user, booking) => {
  if (!user || !booking) return null;
  if (user.isAdmin) return 'admin';

  const isCustomer = booking.customer?.userId &&
    booking.customer.userId.toString() === user._id.toString();

  if (isCustomer) return 'customer';

  const isAssignedProfessional = booking.professional?.userId &&
    booking.professional.userId.toString() === user._id.toString();

  if (isAssignedProfessional) return 'professional';

  return null;
};

const roleKey = (role) => {
  if (role === 'professional') return 'professional';
  if (role === 'admin') return 'admin';
  return 'customer';
};

const getBookingRoomName = (bookingId) => `booking:${bookingId}`;

const normalizeUnreadCounts = (unreadCounts = {}) => ({
  customer: Number(unreadCounts.customer) || 0,
  professional: Number(unreadCounts.professional) || 0,
  admin: Number(unreadCounts.admin) || 0
});

const applyUnreadOnNewMessage = (thread, senderRole) => {
  const senderKey = roleKey(senderRole);

  thread.unreadCounts = normalizeUnreadCounts(thread.unreadCounts);

  if (senderKey === 'customer') {
    if (thread.professionalId) {
      thread.unreadCounts.professional += 1;
    }
    thread.unreadCounts.customer = 0;
  }

  if (senderKey === 'professional') {
    if (thread.customerId) {
      thread.unreadCounts.customer += 1;
    }
    thread.unreadCounts.professional = 0;
  }

  if (senderKey === 'admin') {
    if (thread.customerId) {
      thread.unreadCounts.customer += 1;
    }
    if (thread.professionalId) {
      thread.unreadCounts.professional += 1;
    }
    thread.unreadCounts.admin = 0;
  }
};

const upsertThreadFromBooking = async (booking) => {
  const query = { bookingId: booking._id };
  const update = {
    $setOnInsert: {
      bookingId: booking._id,
      messages: [],
      unreadCounts: { customer: 0, professional: 0, admin: 0 }
    },
    $set: {
      customerId: booking.customer?.userId || null,
      professionalId: booking.professional?.userId || null
    }
  };

  try {
    return await ChatThread.findOneAndUpdate(query, update, { new: true, upsert: true });
  } catch (error) {
    // Parallel first-open requests can race on unique bookingId insert.
    if (error?.code === 11000) {
      return ChatThread.findOneAndUpdate(query, { $set: update.$set }, { new: true });
    }
    throw error;
  }
};

const emitUnreadUpdatesToParticipants = (io, thread) => {
  if (!io || !thread) return;

  if (thread.customerId) {
    io.to(`user:${String(thread.customerId)}`).emit('unread_update', {
      bookingId: String(thread.bookingId),
      unreadCount: thread.unreadCounts?.customer || 0,
      role: 'customer'
    });
  }

  if (thread.professionalId) {
    io.to(`user:${String(thread.professionalId)}`).emit('unread_update', {
      bookingId: String(thread.bookingId),
      unreadCount: thread.unreadCounts?.professional || 0,
      role: 'professional'
    });
  }
};

const toConversationPayload = (thread, booking, role) => {
  const counterpart = role === 'professional'
    ? {
        userId: booking.customer?.userId || null,
        name: booking.customer?.name || 'Customer',
        phone: booking.customer?.phone || '',
        email: booking.customer?.email || '',
        userType: 'customer'
      }
    : {
        userId: booking.professional?.userId || null,
        name: booking.professional?.name || 'Professional not assigned yet',
        phone: booking.professional?.phone || '',
        profession: booking.professional?.profession || '',
        userType: 'professional'
      };

  return {
    booking: {
      id: booking._id,
      status: booking.status,
      serviceType: booking.service?.type || '',
      serviceName: booking.service?.name || booking.service?.type || 'Service',
      scheduleDate: booking.schedule?.date || '',
      scheduleTime: booking.schedule?.time || '',
      address: booking.address?.street || '',
      isEmergency: booking.schedule?.isEmergency || false
    },
    role,
    counterpart,
    unreadCount: thread.unreadCounts?.[roleKey(role)] || 0,
    lastMessage: thread.lastMessage || null,
    messages: thread.messages || []
  };
};

// @route   GET /api/chat/inbox
// @desc    Get inbox metadata for the logged-in user (unread count + last message by booking)
// @access  Private
router.get('/inbox', auth, async (req, res) => {
  try {
    let query = {};

    if (!req.user.isAdmin) {
      query = req.user.userType === 'professional'
        ? { professionalId: req.user._id }
        : { customerId: req.user._id };
    }

    const threads = await ChatThread.find(query)
      .sort({ updatedAt: -1 })
      .select('bookingId unreadCounts lastMessage updatedAt');

    const role = req.user.isAdmin ? 'admin' : req.user.userType;
    const roleUnreadKey = roleKey(role);

    const bookingIds = threads.map((thread) => thread.bookingId);
    const bookings = await Booking.find({ _id: { $in: bookingIds } })
      .select('customer professional service schedule status');

    const bookingById = bookings.reduce((acc, booking) => {
      acc[String(booking._id)] = booking;
      return acc;
    }, {});

    const inbox = threads.map((thread) => {
      const booking = bookingById[String(thread.bookingId)];

      const counterpart = role === 'professional'
        ? {
            name: booking?.customer?.name || 'Customer',
            phone: booking?.customer?.phone || '',
            email: booking?.customer?.email || '',
            userType: 'customer'
          }
        : {
            name: booking?.professional?.name || 'Professional not assigned yet',
            phone: booking?.professional?.phone || '',
            profession: booking?.professional?.profession || '',
            userType: 'professional'
          };

      return {
        bookingId: thread.bookingId,
        unreadCount: thread.unreadCounts?.[roleUnreadKey] || 0,
        lastMessage: thread.lastMessage || null,
        updatedAt: thread.updatedAt,
        booking: {
          status: booking?.status || 'pending',
          serviceName: booking?.service?.name || booking?.service?.type || 'Service',
          scheduleDate: booking?.schedule?.date || '',
          scheduleTime: booking?.schedule?.time || ''
        },
        counterpart
      };
    });

    return res.json({ success: true, inbox });
  } catch (error) {
    console.error('Get chat inbox error:', error);
    return res.status(500).json({ success: false, message: 'Server error loading chat inbox' });
  }
});

// @route   GET /api/chat/booking/:bookingId
// @desc    Get chat conversation for a booking
// @access  Private
router.get('/booking/:bookingId', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const role = getBookingAccessRole(req.user, booking);

    if (!role) {
      return res.status(403).json({ success: false, message: 'You are not allowed to access this booking chat' });
    }

    const thread = await upsertThreadFromBooking(booking);

    const unreadCounts = normalizeUnreadCounts(thread.unreadCounts);
    unreadCounts[roleKey(role)] = 0;

    await ChatThread.updateOne(
      { _id: thread._id },
      { $set: { unreadCounts } }
    );

    thread.unreadCounts = unreadCounts;
    emitUnreadUpdatesToParticipants(req.app.get('io'), thread);

    return res.json({
      success: true,
      conversation: toConversationPayload(thread, booking, role)
    });
  } catch (error) {
    console.error('Get booking chat error:', error);
    return res.status(500).json({ success: false, message: 'Server error loading chat' });
  }
});

// @route   POST /api/chat/booking/:bookingId/messages
// @desc    Send a chat message for a booking
// @access  Private
router.post('/booking/:bookingId/messages', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    const cleanText = text.trim();
    if (cleanText.length > 2000) {
      return res.status(400).json({ success: false, message: 'Message is too long' });
    }

    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const role = getBookingAccessRole(req.user, booking);
    if (!role) {
      return res.status(403).json({ success: false, message: 'You are not allowed to send messages for this booking' });
    }

    const thread = await upsertThreadFromBooking(booking);

    const message = {
      _id: new mongoose.Types.ObjectId(),
      sender: {
        userId: req.user._id,
        name: req.user.name,
        userType: req.user.isAdmin ? 'admin' : req.user.userType
      },
      text: cleanText,
      sentAt: new Date()
    };

    thread.messages.push(message);
    thread.lastMessage = {
      text: cleanText,
      senderId: req.user._id,
      sentAt: message.sentAt
    };

    applyUnreadOnNewMessage(thread, role);

    const saved = await ChatThread.findOneAndUpdate(
      { bookingId: booking._id },
      {
        $push: { messages: message },
        $set: {
          lastMessage: thread.lastMessage,
          unreadCounts: thread.unreadCounts
        }
      },
      { new: true }
    );

    const io = req.app.get('io');
    if (io) {
      io.to(getBookingRoomName(String(booking._id))).emit('new_message', {
        bookingId: String(booking._id),
        message,
        unreadCounts: (saved || thread).unreadCounts
      });
    }

    emitUnreadUpdatesToParticipants(req.app.get('io'), saved || thread);

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      chatMessage: message
    });
  } catch (error) {
    console.error('Send chat message error:', error);
    return res.status(500).json({ success: false, message: 'Server error sending chat message' });
  }
});

// @route   POST /api/chat/booking/:bookingId/read
// @desc    Mark chat as read for logged-in user
// @access  Private
router.post('/booking/:bookingId/read', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const role = getBookingAccessRole(req.user, booking);
    if (!role) {
      return res.status(403).json({ success: false, message: 'You are not allowed for this booking chat' });
    }

    const thread = await upsertThreadFromBooking(booking);
    const key = roleKey(role);

    const unreadCounts = normalizeUnreadCounts(thread.unreadCounts);
    unreadCounts[key] = 0;

    await ChatThread.updateOne(
      { _id: thread._id },
      { $set: { unreadCounts } }
    );

    thread.unreadCounts = unreadCounts;
    emitUnreadUpdatesToParticipants(req.app.get('io'), thread);

    return res.json({ success: true });
  } catch (error) {
    console.error('Mark chat as read error:', error);
    return res.status(500).json({ success: false, message: 'Server error marking chat as read' });
  }
});

module.exports = router;
