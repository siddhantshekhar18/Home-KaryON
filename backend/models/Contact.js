const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  // Customer Information
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Please provide your phone number'],
    trim: true
  },
  
  // Service Information
  service: {
    type: String,
    default: ''
  },
  
  // Schedule Information
  preferredDate: {
    type: String,
    default: ''
  },
  preferredTime: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  
  // Message Details
  message: {
    type: String,
    required: [true, 'Please provide your message']
  },
  urgency: {
    type: String,
    enum: ['low', 'normal', 'high', 'emergency'],
    default: 'normal'
  },
  
  // Status
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'closed'],
    default: 'new'
  },
  
  // Admin Notes
  adminNotes: {
    type: String,
    default: ''
  },
  
  // Reply
  repliedAt: Date,
  repliedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
ContactSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Contact', ContactSchema);
