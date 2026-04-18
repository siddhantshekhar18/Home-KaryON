const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const getDefaultProfileImage = (email) => {
  if (!email) {
    return '';
  }

  const normalizedEmail = email.toLowerCase().trim();
  const hash = crypto.createHash('md5').update(normalizedEmail).digest('hex');
  return `https://www.gravatar.com/avatar/${hash}?s=200&d=identicon&r=PG`;
};

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    unique: true,
    match: [/^\d{10}$/, 'Please provide a valid 10-digit phone number']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  userType: {
    type: String,
    enum: ['customer', 'professional'],
    default: 'customer'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Customer specific fields
  address: {
    street: String,
    city: String,
    zipCode: String
  },
  // Professional specific fields
  profession: {
    type: String,
    enum: ['Plumber', 'Electrician', 'Carpenter', 'Painter', 'Cleaner', 'HVAC Technician', 'Gardener', 'Moving Specialist', 'Handyman', 'Tutor', ''],
    default: ''
  },
  experience: {
    type: String,
    default: ''
  },
  skills: [{
    type: String
  }],
  certifications: {
    type: String,
    default: ''
  },
  hourlyRate: {
    type: Number,
    default: null
  },
  bio: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: function defaultProfileImage() {
      return getDefaultProfileImage(this.email);
    }
  },
  idProof: {
    type: String,
    default: ''
  },
  // OTP for phone login
  phoneOtp: {
    type: String,
    select: false
  },
  phoneOtpExpire: {
    type: Date,
    select: false
  },
    // Password reset
    resetPasswordToken: {
      type: String,
      select: false
    },
    resetPasswordExpire: {
      type: Date,
      select: false
    },
  isVerified: {
    type: Boolean,
    default: false
  },
  settings: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      marketing: {
        type: Boolean,
        default: false
      },
      bookingReminders: {
        type: Boolean,
        default: true
      },
      securityAlerts: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      showProfile: {
        type: Boolean,
        default: true
      },
      showPhone: {
        type: Boolean,
        default: false
      },
      showEmail: {
        type: Boolean,
        default: false
      },
      dataSharing: {
        type: Boolean,
        default: false
      },
      searchEngineIndex: {
        type: Boolean,
        default: false
      }
    },
    preferences: {
      language: {
        type: String,
        default: 'en'
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system'
      },
      timezone: {
        type: String,
        default: 'Asia/Kolkata'
      },
      dateFormat: {
        type: String,
        enum: ['dd-mm-yyyy', 'mm-dd-yyyy', 'yyyy-mm-dd'],
        default: 'dd-mm-yyyy'
      },
      currency: {
        type: String,
        default: 'INR'
      },
      compactMode: {
        type: Boolean,
        default: false
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.virtual('isAdmin').get(function isAdmin() {
  return this.role === 'admin';
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET || 'karyon_secret_key', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash OTP
UserSchema.methods.generatePhoneOtp = async function() {
  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Hash the OTP
  const salt = await bcrypt.genSalt(10);
  const hashedOtp = await bcrypt.hash(otp, salt);
  
  // Set expiry to 10 minutes
  const expiry = new Date(Date.now() + 10 * 60 * 1000);
  
  this.phoneOtp = hashedOtp;
  this.phoneOtpExpire = expiry;
  
  return otp;
};

// Verify OTP
UserSchema.methods.verifyPhoneOtp = async function(enteredOtp) {
  if (!this.phoneOtp || !this.phoneOtpExpire) {
    return false;
  }
  
  // Check if OTP is expired
  if (new Date() > this.phoneOtpExpire) {
    return false;
  }
  
  return await bcrypt.compare(enteredOtp, this.phoneOtp);
};

// Generate and hash password reset token
UserSchema.methods.generatePasswordResetToken = function() {
  const resetToken = require('crypto').randomBytes(32).toString('hex');
  this.resetPasswordToken = require('crypto')
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 min
  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
