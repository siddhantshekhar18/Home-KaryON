const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  sender: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    userType: {
      type: String,
      enum: ['customer', 'professional', 'admin'],
      default: 'customer'
    }
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const ChatThreadSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true,
    index: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  professionalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  messages: {
    type: [ChatMessageSchema],
    default: []
  },
  lastMessage: {
    text: {
      type: String,
      default: ''
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    sentAt: {
      type: Date,
      default: null
    }
  },
  unreadCounts: {
    customer: {
      type: Number,
      default: 0
    },
    professional: {
      type: Number,
      default: 0
    },
    admin: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ChatThread', ChatThreadSchema);
