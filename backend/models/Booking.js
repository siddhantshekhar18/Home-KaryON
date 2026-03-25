const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  // Customer Information
  customer: {
    name: {
      type: String,
      required: [true, 'Please provide your name']
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
      match: [/^\d{6,15}$/, 'Please provide a valid phone number']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },

  // Service Details
  service: {
    type: {
      type: String,
      required: [true, 'Please specify service type'],
      enum: ['Plumbing', 'Electrical', 'Carpentry', 'Cleaning', 'Painting', 'HVAC', 'Moving', 'Gardening', 'Tutoring', 'Handyman']
    },
    name: {
      type: String,
      required: [true, 'Please specify service name']
    },
    description: {
      type: String,
      required: [true, 'Please describe the problem']
    },
    subService: {
      type: String,
      default: ''
    }
  },

  // Schedule
  schedule: {
    date: {
      type: String,
      required: [true, 'Please select a date']
    },
    time: {
      type: String,
      required: [true, 'Please select a time slot']
    },
    isEmergency: {
      type: Boolean,
      default: false
    }
  },

  // Address
  address: {
    street: {
      type: String,
      required: [true, 'Please provide your address']
    },
    city: {
      type: String,
      default: ''
    },
    zipCode: {
      type: String,
      default: ''
    }
  },

  // Booking Status
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },

  // Professional Assignment
  professional: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    phone: String,
    profession: String,
    assignedAt: Date
  },

  // Pricing
  pricing: {
    basePrice: {
      type: Number,
      default: 0
    },
    additionalCharges: {
      type: Number,
      default: 0
    },
    totalPrice: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },

  // Payment
  payment: {
    method: {
      type: String,
      enum: ['cash', 'card', 'upi', 'online'],
      default: 'cash'
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },

  // Review/Rating
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    reviewedAt: Date
  },

  // Live tracking data shared by the assigned professional
  tracking: {
    isSharing: {
      type: Boolean,
      default: false
    },
    currentLocation: {
      latitude: {
        type: Number,
        default: null
      },
      longitude: {
        type: Number,
        default: null
      },
      accuracy: {
        type: Number,
        default: null
      },
      heading: {
        type: Number,
        default: null
      },
      speed: {
        type: Number,
        default: null
      },
      updatedAt: {
        type: Date,
        default: null
      }
    }
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: Date,
  customerAddressSharedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  cancellationReason: String
});

// Update timestamp on save
BookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate total price
BookingSchema.methods.calculateTotal = function() {
  this.pricing.totalPrice = this.pricing.basePrice + this.pricing.additionalCharges;
  return this.pricing.totalPrice;
};

module.exports = mongoose.model('Booking', BookingSchema);
