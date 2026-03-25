const express = require('express');
const router = express.Router();
const FAQ = require('../models/FAQ');

// Seed default FAQs if none exist
const seedFAQs = async () => {
  const count = await FAQ.countDocuments();
  if (count > 0) return;

  const defaults = [
    // General
    { category: 'General', order: 1, question: 'What is KaryON?', answer: 'KaryON is a trusted home services platform that connects you with verified professionals for cleaning, plumbing, electrical work, painting, tutoring, and more — all at your doorstep.' },
    { category: 'General', order: 2, question: 'In which cities is KaryON available?', answer: 'KaryON is currently available in Kanpur and select neighboring cities. We are rapidly expanding — stay tuned for updates on new cities.' },
    { category: 'General', order: 3, question: 'How do I contact KaryON support?', answer: 'You can reach us at support@karyon.com or call +91 93057 24440 Monday through Sunday, 8 AM to 10 PM. You can also use our Contact page for detailed inquiries.' },
    // Booking
    { category: 'Booking', order: 1, question: 'How do I book a service?', answer: 'Simply choose a service from our Services page, pick your preferred date and time, provide your address, and confirm the booking. A verified professional will be assigned and you will receive a confirmation.' },
    { category: 'Booking', order: 2, question: 'Can I reschedule or cancel a booking?', answer: 'Yes, you can reschedule or cancel a booking up to 2 hours before the scheduled time without any charge. Go to My Bookings and select the booking you want to modify.' },
    { category: 'Booking', order: 3, question: 'How far in advance can I book a service?', answer: 'You can book a service up to 30 days in advance. Same-day bookings are also available for most services, subject to professional availability.' },
    { category: 'Booking', order: 4, question: 'Will I get notified when a professional is assigned?', answer: 'Yes, you will receive an email confirmation once a professional is assigned to your booking, including their name and estimated arrival time.' },
    // Payment
    { category: 'Payment', order: 1, question: 'What payment methods are accepted?', answer: 'We accept UPI, credit/debit cards, net banking, and cash on service. All online payments are secured via industry-standard encryption.' },
    { category: 'Payment', order: 2, question: 'When am I charged for a service?', answer: 'You are charged only after the service is completed and you confirm satisfaction. For pre-paid bookings, the amount is held and released upon completion.' },
    { category: 'Payment', order: 3, question: 'Is there a refund policy?', answer: 'Yes. If you are unsatisfied with the service, contact us within 24 hours and we will arrange a re-service or a full refund, depending on the situation.' },
    // Services
    { category: 'Services', order: 1, question: 'Are the professionals verified?', answer: 'Absolutely. Every professional on KaryON undergoes background checks, identity verification, skill assessment, and training before being onboarded.' },
    { category: 'Services', order: 2, question: 'What services does KaryON offer?', answer: 'We offer Home Cleaning, Plumbing, Electrical, Painting, Tutoring, and Moving & Shifting services. Visit our Services page for the full list.' },
    { category: 'Services', order: 3, question: 'What if the professional does not show up?', answer: 'In the rare event a professional does not show up, contact us immediately. We will reassign another professional within the hour or offer a full refund.' },
    // Account
    { category: 'Account', order: 1, question: 'Do I need an account to book a service?', answer: 'Yes, an account is required to book services so we can keep track of your bookings and send confirmations. Signing up is free and takes less than a minute.' },
    { category: 'Account', order: 2, question: 'How do I reset my password?', answer: 'On the Login page, click "Forgot Password", enter your registered email, and follow the reset link sent to your inbox.' },
    // Safety
    { category: 'Safety', order: 1, question: 'Is it safe to let a professional into my home?', answer: 'Yes. All professionals are background-checked, ID-verified, and rated by previous customers. You can view a professional\'s rating and reviews before they arrive.' },
    { category: 'Safety', order: 2, question: 'What safety measures do professionals follow?', answer: 'All professionals are required to wear clean uniforms, carry ID, and follow KaryON\'s code of conduct. They are also trained in safety protocols for each service category.' }
  ];

  await FAQ.insertMany(defaults);
};

// @route   GET /api/faq
// @desc    Get all active FAQs, optionally filtered by category
// @access  Public
router.get('/', async (req, res) => {
  try {
    await seedFAQs();
    const { category } = req.query;
    const filter = { isActive: true };
    if (category && category !== 'All') filter.category = category;

    const faqs = await FAQ.find(filter).sort({ category: 1, order: 1 });
    res.json({ success: true, count: faqs.length, data: faqs });
  } catch (error) {
    console.error('FAQ fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching FAQs' });
  }
});

// @route   POST /api/faq/:id/helpful
// @desc    Mark a FAQ as helpful or not helpful
// @access  Public
router.post('/:id/helpful', async (req, res) => {
  try {
    const { vote } = req.body; // 'yes' | 'no'
    if (!['yes', 'no'].includes(vote)) {
      return res.status(400).json({ success: false, message: 'vote must be "yes" or "no"' });
    }

    const update = vote === 'yes'
      ? { $inc: { helpful: 1 } }
      : { $inc: { notHelpful: 1 } };

    const faq = await FAQ.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found' });

    res.json({ success: true, helpful: faq.helpful, notHelpful: faq.notHelpful });
  } catch (error) {
    console.error('FAQ vote error:', error);
    res.status(500).json({ success: false, message: 'Server error recording vote' });
  }
});

module.exports = router;
