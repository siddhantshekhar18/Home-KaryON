const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  reporter: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    }
  },
  target: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    },
    userType: {
      type: String,
      enum: ['customer', 'professional', 'admin', 'unknown'],
      default: 'unknown'
    }
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  reason: {
    type: String,
    enum: ['abusive-behavior', 'fraud', 'no-show', 'poor-service', 'payment-issue', 'safety-concern', 'other'],
    required: true
  },
  details: {
    type: String,
    required: true,
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['open', 'in-review', 'resolved', 'rejected'],
    default: 'open'
  },
  adminReview: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    note: {
      type: String,
      default: ''
    },
    actionTaken: {
      type: String,
      enum: ['none', 'warned', 'suspended', 'reactivated'],
      default: 'none'
    },
    reviewedAt: {
      type: Date,
      default: null
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

ReportSchema.pre('save', function onSave(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Report', ReportSchema);
