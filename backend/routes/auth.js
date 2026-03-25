const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const hasValidGoogleClientId =
  Boolean(googleClientId) &&
  !googleClientId.startsWith('your_') &&
  googleClientId.endsWith('.apps.googleusercontent.com');
const googleOAuthClient = hasValidGoogleClientId ? new OAuth2Client(googleClientId) : null;

const generateUniqueGooglePhone = async () => {
  // Keep phone as a 10-digit unique value so existing schema validations continue to work.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = `${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;
    const exists = await User.findOne({ phone: candidate }).select('_id');
    if (!exists) {
      return candidate;
    }
  }
  return `${Math.floor(1000000000 + Math.random() * 9000000000)}`;
};

const getDefaultProfileImage = (email) => {
  if (!email) {
    return '';
  }

  const normalizedEmail = email.toLowerCase().trim();
  const hash = crypto.createHash('md5').update(normalizedEmail).digest('hex');
  return `https://www.gravatar.com/avatar/${hash}?s=200&d=identicon&r=PG`;
};

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const safeBaseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, '_');
    cb(null, `${Date.now()}-${safeBaseName}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  const imageTypes = /image\/(jpeg|jpg|png|webp)/;
  const pdfType = file.mimetype === 'application/pdf';

  if (file.fieldname === 'profileImage') {
    if (imageTypes.test(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error('Profile image must be a JPG, PNG, or WEBP file'));
  }

  if (file.fieldname === 'idProof') {
    if (imageTypes.test(file.mimetype) || pdfType) {
      return cb(null, true);
    }
    return cb(new Error('ID proof must be a PDF, JPG, PNG, or WEBP file'));
  }

  cb(new Error('Invalid upload field'));
};

const registerUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

const normalizeSkills = (skillsInput) => {
  if (!skillsInput) {
    return [];
  }

  if (Array.isArray(skillsInput)) {
    return skillsInput.filter(Boolean);
  }

  if (typeof skillsInput === 'string') {
    try {
      const parsed = JSON.parse(skillsInput);
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }
    } catch (error) {
      return skillsInput
        .split(',')
        .map(skill => skill.trim())
        .filter(Boolean);
    }
  }

  return [];
};

const toPublicFilePath = (file) => {
  if (!file || !file.filename) {
    return '';
  }
  return `/uploads/${file.filename}`;
};

const toPublicUrl = (req, value) => {
  if (!value) {
    return '';
  }
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  if (value.startsWith('/uploads/')) {
    return `${req.protocol}://${req.get('host')}${value}`;
  }
  return value;
};

const getAuthenticatedUserId = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'No authorization token provided' };
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'karyon_secret_key');
    return { userId: decoded.id };
  } catch (error) {
    return { error: 'Invalid or expired token' };
  }
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUpload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'idProof', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      userType,
      address,
      city,
      zipCode,
      profession,
      experience,
      skills,
      certifications,
      hourlyRate,
      bio
    } = req.body;

    const normalizedSkills = normalizeSkills(skills);
    const profileImageFile = req.files?.profileImage?.[0];
    const idProofFile = req.files?.idProof?.[0];
    const savedProfileImage = toPublicFilePath(profileImageFile);
    const savedIdProof = toPublicFilePath(idProofFile);

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { phone }] 
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }
      if (existingUser.phone === phone) {
        return res.status(400).json({ success: false, message: 'Phone number already registered' });
      }
    }

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      userType: userType || 'customer',
      profileImage: savedProfileImage || getDefaultProfileImage(email),
      address: userType === 'customer' ? { street: address, city, zipCode } : undefined,
      profession: userType === 'professional' ? profession : undefined,
      experience: userType === 'professional' ? experience : undefined,
      skills: userType === 'professional' ? normalizedSkills : undefined,
      certifications: userType === 'professional' ? certifications : undefined,
      hourlyRate: userType === 'professional' ? hourlyRate : undefined,
      bio: userType === 'professional' ? bio : undefined,
      idProof: userType === 'professional' ? savedIdProof : ''
    });

    await user.save();

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        profession: user.profession || '',
        experience: user.experience || '',
        bio: user.bio || '',
        hourlyRate: user.hourlyRate || null,
        skills: user.skills || [],
        settings: user.settings || {},
        profileImage: toPublicUrl(req, user.profileImage || getDefaultProfileImage(user.email)),
        idProof: toPublicUrl(req, user.idProof || '')
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login/email
// @desc    Login with email and password
// @access  Public
router.post('/login/email', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.authProvider === 'google') {
      return res.status(400).json({ success: false, message: 'This account uses Google sign-in. Please continue with Google.' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token
    const token = user.getSignedJwtToken();

    res.json({
      success: true,
      token,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        profession: user.profession || '',
        experience: user.experience || '',
        bio: user.bio || '',
        hourlyRate: user.hourlyRate || null,
        skills: user.skills || [],
        settings: user.settings || {},
        profileImage: toPublicUrl(req, user.profileImage || getDefaultProfileImage(user.email)),
        idProof: toPublicUrl(req, user.idProof || '')
      }
    });
  } catch (error) {
    console.error('Email login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// @route   POST /api/auth/google
// @desc    Login or signup using Google credential token
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Google credential token is required' });
    }

    if (!googleOAuthClient || !hasValidGoogleClientId) {
      return res.status(500).json({ success: false, message: 'Google sign-in is not configured on the server' });
    }

    const ticket = await googleOAuthClient.verifyIdToken({
      idToken,
      audience: googleClientId
    });

    const payload = ticket.getPayload();
    const googleId = payload?.sub;
    const email = payload?.email?.toLowerCase();
    const name = payload?.name || 'Google User';
    const profileImage = payload?.picture || getDefaultProfileImage(email);
    const isEmailVerified = payload?.email_verified;

    if (!googleId || !email || !isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Invalid Google account data' });
    }

    let user = await User.findOne({
      $or: [{ googleId }, { email }]
    }).select('+password');

    if (!user) {
      const generatedPhone = await generateUniqueGooglePhone();
      const generatedPassword = crypto.randomBytes(24).toString('hex');

      user = new User({
        name,
        email,
        phone: generatedPhone,
        password: generatedPassword,
        authProvider: 'google',
        googleId,
        profileImage,
        isVerified: true
      });

      await user.save();
    } else {
      let shouldSave = false;

      if (user.authProvider !== 'google') {
        user.authProvider = 'google';
        shouldSave = true;
      }
      if (!user.googleId) {
        user.googleId = googleId;
        shouldSave = true;
      }
      if (!user.profileImage || user.profileImage.includes('gravatar.com/avatar')) {
        user.profileImage = profileImage;
        shouldSave = true;
      }

      if (shouldSave) {
        await user.save({ validateBeforeSave: false });
      }
    }

    const token = user.getSignedJwtToken();

    return res.json({
      success: true,
      token,
      message: 'Google login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        profession: user.profession || '',
        experience: user.experience || '',
        bio: user.bio || '',
        hourlyRate: user.hourlyRate || null,
        skills: user.skills || [],
        settings: user.settings || {},
        profileImage: toPublicUrl(req, user.profileImage || getDefaultProfileImage(user.email)),
        idProof: toPublicUrl(req, user.idProof || '')
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    return res.status(500).json({ success: false, message: 'Google login failed. Please try again.' });
  }
});

// @route   POST /api/auth/login/phone/send-otp
// @desc    Send OTP to phone number
// @access  Public
router.post('/login/phone/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Please provide phone number' });
    }

    // Check if user exists
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this phone number' });
    }

    // Generate OTP
    const otp = user.generatePhoneOtp();
    await user.save();

    // In production, send OTP via SMS using Twilio
    // For development, we'll log the OTP
    console.log(`OTP for ${phone}: ${otp}`);

    // For demo purposes, return the OTP in response (remove this in production)
    res.json({
      success: true,
      message: 'OTP sent successfully to your phone number',
      // Remove this in production
      devOtp: otp
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error sending OTP' });
  }
});

// @route   POST /api/auth/login/phone/verify-otp
// @desc    Verify OTP and login
// @access  Public
router.post('/login/phone/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide phone number and OTP' });
    }

    // Find user with OTP
    const user = await User.findOne({ phone }).select('+phoneOtp +phoneOtpExpire');

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this phone number' });
    }

    // Check if OTP is valid
    if (!user.phoneOtp || !user.phoneOtpExpire) {
      return res.status(400).json({ success: false, message: 'Please request a new OTP' });
    }

    // Check if OTP is expired
    if (new Date() > user.phoneOtpExpire) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one' });
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, user.phoneOtp);

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Clear OTP after successful verification
    user.phoneOtp = undefined;
    user.phoneOtpExpire = undefined;
    await user.save();

    // Generate token
    const token = user.getSignedJwtToken();

    res.json({
      success: true,
      token,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        profession: user.profession || '',
        experience: user.experience || '',
        bio: user.bio || '',
        hourlyRate: user.hourlyRate || null,
        skills: user.skills || [],
        settings: user.settings || {},
        profileImage: toPublicUrl(req, user.profileImage || getDefaultProfileImage(user.email)),
        idProof: toPublicUrl(req, user.idProof || '')
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error verifying OTP' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset link to email
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your email address' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Generic message to prevent user enumeration
      return res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
    }

    if (user.authProvider === 'google') {
      return res.status(400).json({ success: false, message: 'This account uses Google sign-in and does not require a password reset.' });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    // Try to send email via nodemailer
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: `"KaryON Support" <${process.env.EMAIL_USER || 'noreply@karyon.com'}>`,
        to: user.email,
        subject: 'KaryON – Password Reset Request',
        html: `
          <div style="font-family:Poppins,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;border-radius:16px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#667eea,#502222);padding:40px 32px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:28px;font-weight:800;">KaryON</h1>
              <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Trusted Home Services</p>
            </div>
            <div style="padding:40px 32px;">
              <h2 style="color:#1e293b;margin:0 0 16px;font-size:22px;">Reset Your Password</h2>
              <p style="color:#4b5563;line-height:1.7;margin:0 0 24px;">
                Hi <strong>${user.name}</strong>,<br/>
                We received a request to reset the password for your KaryON account. Click the button below to set a new password.
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#667eea,#502222);color:#fff;padding:14px 36px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;">Reset Password</a>
              </div>
              <p style="color:#64748b;font-size:13px;line-height:1.6;">
                This link will expire in <strong>30 minutes</strong>. If you didn't request a password reset, you can safely ignore this email.
              </p>
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;"/>
              <p style="color:#94a3b8;font-size:12px;">If the button doesn't work, copy and paste this link:<br/>
                <a href="${resetUrl}" style="color:#667eea;word-break:break-all;">${resetUrl}</a>
              </p>
            </div>
          </div>
        `
      });

      res.json({ success: true, message: 'Password reset link sent to your email.' });
    } catch (emailError) {
      console.error('Email send error:', emailError.message);
      // Clear the token if email failed so user can retry
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      // In dev mode expose the reset URL for testing
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[DEV] Password reset URL for ${user.email}: ${resetUrl}`);
        return res.json({
          success: true,
          message: 'Email service not configured. Check server console for the reset link (dev mode).',
          devResetUrl: resetUrl
        });
      }

      return res.status(500).json({ success: false, message: 'Could not send reset email. Please try again later.' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password using token
// @access  Public
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    // Hash the incoming token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    }).select('+resetPasswordToken +resetPasswordExpire');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset link. Please request a new one.' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful. You can now log in with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile information
// @access  Private
router.put('/profile', registerUpload.fields([
  { name: 'profileImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { userId, error: authError } = getAuthenticatedUserId(req);
    if (authError) {
      return res.status(401).json({ success: false, message: authError });
    }

    const { name, email, phone, address, profession, experience, skills, hourlyRate, bio } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update basic fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    
    // Handle profile image if uploaded
    if (req.files?.profileImage?.[0]) {
      user.profileImage = toPublicFilePath(req.files.profileImage[0]);
    }

    // Update address for customers
    if (user.userType === 'customer' && address) {
      try {
        const parsedAddress = typeof address === 'string' ? JSON.parse(address) : address;
        user.address = {
          street: parsedAddress.street || user.address?.street || '',
          city: parsedAddress.city || user.address?.city || '',
          zipCode: parsedAddress.zipCode || user.address?.zipCode || ''
        };
      } catch (e) {
        // If address parsing fails, skip it
      }
    }

    // Update professional fields for professionals
    if (user.userType === 'professional') {
      if (hourlyRate) user.hourlyRate = hourlyRate;
      if (bio) user.bio = bio.slice(0, 500); // Limit bio to 500 chars
    }

    await user.save();

    // Return updated user
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      profileImage: toPublicUrl(req, user.profileImage || getDefaultProfileImage(user.email)),
      address: user.address,
      profession: user.profession || '',
      experience: user.experience || '',
      bio: user.bio || '',
      hourlyRate: user.hourlyRate || null,
      skills: user.skills || [],
      settings: user.settings || {},
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Profile update error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change password for authenticated user
// @access  Private
router.put('/change-password', async (req, res) => {
  try {
    const { userId, error: authError } = getAuthenticatedUserId(req);
    if (authError) {
      return res.status(401).json({ success: false, message: authError });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.authProvider === 'google') {
      return res.status(400).json({ success: false, message: 'Password change is not available for Google sign-in accounts' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    return res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ success: false, message: 'Server error changing password' });
  }
});

// @route   GET /api/auth/settings
// @desc    Get settings for authenticated user
// @access  Private
router.get('/settings', async (req, res) => {
  try {
    const { userId, error: authError } = getAuthenticatedUserId(req);
    if (authError) {
      return res.status(401).json({ success: false, message: authError });
    }

    const user = await User.findById(userId).select('settings');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      settings: user.settings || {}
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching settings' });
  }
});

// @route   PUT /api/auth/settings
// @desc    Update settings for authenticated user
// @access  Private
router.put('/settings', async (req, res) => {
  try {
    const { userId, error: authError } = getAuthenticatedUserId(req);
    if (authError) {
      return res.status(401).json({ success: false, message: authError });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const incoming = req.body || {};
    const existing = user.settings || {};

    user.settings = {
      ...existing,
      notifications: {
        ...(existing.notifications || {}),
        ...(incoming.notifications || {})
      },
      privacy: {
        ...(existing.privacy || {}),
        ...(incoming.privacy || {})
      },
      preferences: {
        ...(existing.preferences || {}),
        ...(incoming.preferences || {})
      }
    };

    await user.save();

    return res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: user.settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return res.status(500).json({ success: false, message: 'Server error saving settings' });
  }
});

// @route   GET /api/auth/public-stats
// @desc    Public platform stats for marketing pages
// @access  Public
router.get('/public-stats', async (req, res) => {
  try {
    const [customers, professionals, totalUsers] = await Promise.all([
      User.countDocuments({ userType: 'customer' }),
      User.countDocuments({ userType: 'professional' }),
      User.countDocuments({})
    ]);

    return res.json({
      success: true,
      data: {
        customers,
        professionals,
        totalUsers
      }
    });
  } catch (error) {
    console.error('Public stats error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching public stats' });
  }
});

module.exports = router;
