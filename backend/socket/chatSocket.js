const jwt = require('jsonwebtoken');

const Booking = require('../models/Booking');
const User = require('../models/User');
const ChatThread = require('../models/ChatThread');

const getRoomName = (bookingId) => `booking:${bookingId}`;
const getUserRoomName = (userId) => `user:${userId}`;

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

const applyUnreadOnNewMessage = (thread, senderRole) => {
  const senderKey = roleKey(senderRole);

  thread.unreadCounts = {
    customer: thread.unreadCounts?.customer || 0,
    professional: thread.unreadCounts?.professional || 0,
    admin: thread.unreadCounts?.admin || 0
  };

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
      customerId: booking.customer?.userId || null,
      professionalId: booking.professional?.userId || null,
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
  if (!thread) return;

  if (thread.customerId) {
    io.to(getUserRoomName(String(thread.customerId))).emit('unread_update', {
      bookingId: String(thread.bookingId),
      unreadCount: thread.unreadCounts?.customer || 0,
      role: 'customer'
    });
  }

  if (thread.professionalId) {
    io.to(getUserRoomName(String(thread.professionalId))).emit('unread_update', {
      bookingId: String(thread.bookingId),
      unreadCount: thread.unreadCounts?.professional || 0,
      role: 'professional'
    });
  }
};

const getSocketToken = (socket) => {
  const authToken = socket.handshake.auth?.token;
  if (authToken) return authToken;

  const headerAuth = socket.handshake.headers?.authorization;
  if (headerAuth && headerAuth.startsWith('Bearer ')) {
    return headerAuth.split(' ')[1];
  }

  return null;
};

const initChatSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = getSocketToken(socket);
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'karyon_secret_key');
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      return next();
    } catch (error) {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(getUserRoomName(String(socket.user._id)));

    socket.on('join_booking', async (payload, ack) => {
      try {
        const bookingId = payload?.bookingId;
        if (!bookingId) {
          ack?.({ success: false, message: 'Booking id is required' });
          return;
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
          ack?.({ success: false, message: 'Booking not found' });
          return;
        }

        const role = getBookingAccessRole(socket.user, booking);
        if (!role) {
          ack?.({ success: false, message: 'Not allowed for this booking chat' });
          return;
        }

        await upsertThreadFromBooking(booking);

        const room = getRoomName(bookingId);
        socket.join(room);

        ack?.({ success: true, room, role });
      } catch (error) {
        ack?.({ success: false, message: 'Failed to join booking chat' });
      }
    });

    socket.on('send_message', async (payload, ack) => {
      try {
        const bookingId = payload?.bookingId;
        const text = payload?.text?.trim();

        if (!bookingId || !text) {
          ack?.({ success: false, message: 'Booking id and message are required' });
          return;
        }

        if (text.length > 2000) {
          ack?.({ success: false, message: 'Message is too long' });
          return;
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
          ack?.({ success: false, message: 'Booking not found' });
          return;
        }

        const role = getBookingAccessRole(socket.user, booking);
        if (!role) {
          ack?.({ success: false, message: 'Not allowed to send messages for this booking' });
          return;
        }

        const thread = await upsertThreadFromBooking(booking);

        const message = {
          sender: {
            userId: socket.user._id,
            name: socket.user.name,
            userType: socket.user.isAdmin ? 'admin' : socket.user.userType
          },
          text,
          sentAt: new Date()
        };

        thread.messages.push(message);
        thread.lastMessage = {
          text,
          senderId: socket.user._id,
          sentAt: message.sentAt
        };

        applyUnreadOnNewMessage(thread, role);

        await thread.save();

        const savedMessage = thread.messages[thread.messages.length - 1];
        const room = getRoomName(bookingId);

        io.to(room).emit('new_message', {
          bookingId,
          message: savedMessage,
          unreadCounts: thread.unreadCounts
        });

        emitUnreadUpdatesToParticipants(io, thread);

        ack?.({ success: true, message: savedMessage });
      } catch (error) {
        ack?.({ success: false, message: 'Failed to send message' });
      }
    });

    socket.on('typing', (payload) => {
      const bookingId = payload?.bookingId;
      if (!bookingId) return;

      const room = getRoomName(bookingId);
      socket.to(room).emit('typing', {
        bookingId,
        userId: socket.user._id,
        userName: socket.user.name,
        userType: socket.user.userType
      });
    });

    socket.on('stop_typing', (payload) => {
      const bookingId = payload?.bookingId;
      if (!bookingId) return;

      const room = getRoomName(bookingId);
      socket.to(room).emit('stop_typing', {
        bookingId,
        userId: socket.user._id
      });
    });
  });
};

module.exports = initChatSocket;
