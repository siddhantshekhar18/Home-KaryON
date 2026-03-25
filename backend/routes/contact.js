const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const formatValue = (value) => {
  const normalized = typeof value === 'string' ? value.trim() : value;
  if (!normalized) {
    return 'Not provided';
  }
  return normalized;
};

const sendContactNotificationEmail = async (contact) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return { sent: false, reason: 'Email service is not configured' };
  }

  const receiver = process.env.CONTACT_RECEIVER_EMAIL || process.env.EMAIL_USER;
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const createdAt = new Date(contact.createdAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="background:#1e293b;color:#fff;padding:20px 24px;">
        <h2 style="margin:0;font-size:20px;">New Contact Form Submission</h2>
        <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">KaryON website contact form</p>
      </div>
      <div style="padding:20px 24px;color:#0f172a;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;font-weight:700;width:170px;">Name</td><td style="padding:8px 0;">${escapeHtml(formatValue(contact.name))}</td></tr>
          <tr><td style="padding:8px 0;font-weight:700;">Email</td><td style="padding:8px 0;">${escapeHtml(formatValue(contact.email))}</td></tr>
          <tr><td style="padding:8px 0;font-weight:700;">Phone</td><td style="padding:8px 0;">${escapeHtml(formatValue(contact.phone))}</td></tr>
          <tr><td style="padding:8px 0;font-weight:700;">Service</td><td style="padding:8px 0;">${escapeHtml(formatValue(contact.service))}</td></tr>
          <tr><td style="padding:8px 0;font-weight:700;">Preferred Date</td><td style="padding:8px 0;">${escapeHtml(formatValue(contact.preferredDate))}</td></tr>
          <tr><td style="padding:8px 0;font-weight:700;">Preferred Time</td><td style="padding:8px 0;">${escapeHtml(formatValue(contact.preferredTime))}</td></tr>
          <tr><td style="padding:8px 0;font-weight:700;">Urgency</td><td style="padding:8px 0;">${escapeHtml(formatValue(contact.urgency))}</td></tr>
          <tr><td style="padding:8px 0;font-weight:700;">Address</td><td style="padding:8px 0;">${escapeHtml(formatValue(contact.address))}</td></tr>
          <tr><td style="padding:8px 0;font-weight:700;vertical-align:top;">Message</td><td style="padding:8px 0;white-space:pre-wrap;">${escapeHtml(formatValue(contact.message))}</td></tr>
          <tr><td style="padding:8px 0;font-weight:700;">Submitted At</td><td style="padding:8px 0;">${escapeHtml(createdAt)}</td></tr>
        </table>
      </div>
    </div>
  `;

  const text = [
    'New Contact Form Submission',
    `Name: ${formatValue(contact.name)}`,
    `Email: ${formatValue(contact.email)}`,
    `Phone: ${formatValue(contact.phone)}`,
    `Service: ${formatValue(contact.service)}`,
    `Preferred Date: ${formatValue(contact.preferredDate)}`,
    `Preferred Time: ${formatValue(contact.preferredTime)}`,
    `Urgency: ${formatValue(contact.urgency)}`,
    `Address: ${formatValue(contact.address)}`,
    `Message: ${formatValue(contact.message)}`,
    `Submitted At: ${createdAt}`
  ].join('\n');

  await transporter.sendMail({
    from: `"KaryON Contact" <${process.env.EMAIL_USER}>`,
    to: receiver,
    replyTo: contact.email,
    subject: `New Contact Form Submission - ${contact.name}`,
    text,
    html
  });

  return { sent: true, receiver };
};

// Middleware to verify JWT token (for admin routes)
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
      req.user = decoded;
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

// @route   POST /api/contact
// @desc    Submit a contact form
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, service, preferredDate, preferredTime, address, message, urgency } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name, email, phone, and message' 
      });
    }

    // Create contact entry
    const contact = new Contact({
      name,
      email: email.toLowerCase(),
      phone,
      service: service || '',
      preferredDate: preferredDate || '',
      preferredTime: preferredTime || '',
      address: address || '',
      message,
      urgency: urgency || 'normal'
    });

    await contact.save();

    let emailNotificationSent = false;
    let emailNotificationReason = '';

    try {
      const emailResult = await sendContactNotificationEmail(contact);
      emailNotificationSent = emailResult.sent;
      emailNotificationReason = emailResult.reason || '';
    } catch (emailError) {
      emailNotificationReason = emailError.message;
      console.error('Contact notification email error:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you within 24 hours.',
      emailNotificationSent,
      ...(emailNotificationReason ? { emailNotificationReason } : {}),
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        createdAt: contact.createdAt
      }
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error submitting contact form' 
    });
  }
});

// @route   GET /api/contact
// @desc    Get all contacts (admin only)
// @access  Private/Admin
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    if (status) {
      query.status = status;
    }

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      count: contacts.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      contacts
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching contacts' 
    });
  }
});

// @route   GET /api/contact/:id
// @desc    Get single contact by ID
// @access  Private/Admin
router.get('/:id', auth, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact not found' 
      });
    }

    res.json({
      success: true,
      contact
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching contact' 
    });
  }
});

// @route   PUT /api/contact/:id
// @desc    Update contact status or add admin notes
// @access  Private/Admin
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact not found' 
      });
    }

    if (status) {
      contact.status = status;
    }
    if (adminNotes) {
      contact.adminNotes = adminNotes;
    }

    await contact.save();

    res.json({
      success: true,
      message: 'Contact updated successfully',
      contact
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating contact' 
    });
  }
});

// @route   DELETE /api/contact/:id
// @desc    Delete a contact
// @access  Private/Admin
router.delete('/:id', auth, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact not found' 
      });
    }

    await contact.deleteOne();

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error deleting contact' 
    });
  }
});

module.exports = router;
