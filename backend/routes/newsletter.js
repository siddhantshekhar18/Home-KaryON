const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');
const nodemailer = require('nodemailer');

const createEmailTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: false,
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });
};

const sendNewsletterThankYouEmail = async (recipientEmail) => {
  const transporter = createEmailTransporter();
  if (!transporter) {
    return { sent: false, reason: 'missing_email_config' };
  }

  const appName = 'KaryON';
  const fromAddress = process.env.EMAIL_USER;

  await transporter.sendMail({
    from: `"${appName} Team" <${fromAddress}>`,
    to: recipientEmail,
    subject: `Thank you for subscribing to ${appName} newsletter`,
    html: `
      <div style="font-family:Poppins,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
        <div style="background:linear-gradient(135deg,#667eea,#502222);padding:28px 24px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:28px;">${appName}</h1>
          <p style="color:rgba(255,255,255,0.88);margin:8px 0 0;">Trusted Home Services</p>
        </div>
        <div style="padding:26px 24px;">
          <h2 style="margin:0 0 12px;color:#0f172a;">Thanks for subscribing</h2>
          <p style="margin:0 0 12px;color:#334155;line-height:1.65;">
            We are happy to have you with us. You will now receive updates about new services, offers, and helpful home-care tips.
          </p>
          <p style="margin:0 0 20px;color:#334155;line-height:1.65;">
            If you did not subscribe, you can ignore this email.
          </p>
          <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">
            Thank you for being part of our community.
          </p>
        </div>
      </div>
    `
  });

  return { sent: true };
};

// @route   POST /api/newsletter/subscribe
// @desc    Subscribe an email to the newsletter
// @access  Public
router.post('/subscribe', async (req, res) => {
  try {
    const { email, agreedToTerms } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    if (!agreedToTerms) {
      return res.status(400).json({ success: false, message: 'You must agree to the Privacy Policy and Terms of Service.' });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const existing = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'This email is already subscribed.' });
    }

    const normalizedEmail = email.toLowerCase();
    await Newsletter.create({ email: normalizedEmail, agreedToTerms: true });

    let emailResult = { sent: false };
    try {
      emailResult = await sendNewsletterThankYouEmail(normalizedEmail);
    } catch (mailError) {
      console.error('Newsletter thank-you email error:', mailError.message);
    }

    return res.status(201).json({
      success: true,
      message: emailResult.sent
        ? 'You have successfully subscribed to our newsletter. A thank-you email has been sent to your Gmail.'
        : 'You have successfully subscribed to our newsletter.'
    });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

module.exports = router;
