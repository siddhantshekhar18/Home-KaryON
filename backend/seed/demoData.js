/**
 * Demo seed – safe to run on every startup (idempotent).
 * Inserts demo users, bookings and chat threads only when the
 * DB is empty (no users present).  This is the go-to path for
 * embedded / portable / zip-shared usage.
 *
 * Demo login credentials (printed to console on seed):
 *   Customer   : customer@demo.com  / Demo@1234
 *   Professional: pro@demo.com      / Demo@1234
 */

const mongoose = require('mongoose');

const User        = require('../models/User');
const Booking     = require('../models/Booking');
const ChatThread  = require('../models/ChatThread');

// Plain text – the User pre-save hook hashes this automatically on create().
const DEMO_PASSWORD = 'Demo@1234';

/* ------------------------------------------------------------------ */
/*  helpers                                                             */
/* ------------------------------------------------------------------ */
const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
};

/* ------------------------------------------------------------------ */
/*  main seed function                                                  */
/* ------------------------------------------------------------------ */
const seedDemoData = async () => {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      // DB already has data – nothing to seed.
      return;
    }

    console.log('\n🌱  Seeding demo data ...\n');

    /* ---- users ---------------------------------------------------- */
    const customer = await User.create({
      name:      'Sona Mehta',
      email:     'customer@demo.com',
      phone:     '9876543210',
      password:  DEMO_PASSWORD,
      userType:  'customer',
      address:   { street: '12, Civil Lines', city: 'Kanpur', zipCode: '208001' },
      isVerified: true
    });

    const professional = await User.create({
      name:        'Siddhant Shekhar',
      email:       'pro@demo.com',
      phone:       '9123456780',
      password:    DEMO_PASSWORD,
      userType:    'professional',
      profession:  'Plumber',
      experience:  '5 years',
      skills:      ['Pipe Repair', 'Leak Detection', 'Drain Cleaning'],
      hourlyRate:  350,
      bio:         'Experienced plumber with 5+ years of residential and commercial plumbing work.',
      isVerified:  true
    });

    const professional2 = await User.create({
      name:        'Priya Singh',
      email:       'pro2@demo.com',
      phone:       '9988776655',
      password:    DEMO_PASSWORD,
      userType:    'professional',
      profession:  'Cleaner',
      experience:  '3 years',
      skills:      ['Deep Cleaning', 'Sanitisation', 'Kitchen Cleaning'],
      hourlyRate:  250,
      bio:         'Detail-oriented home cleaning professional with 3 years of experience.',
      isVerified:  true
    });

    /* ---- bookings ------------------------------------------------- */

    // 1. Pending booking (no professional assigned yet)
    const b1 = await Booking.create({
      customer: {
        name:   customer.name,
        email:  customer.email,
        phone:  customer.phone,
        userId: customer._id
      },
      service: {
        type:        'Plumbing',
        name:        'Pipe Leak Repair',
        description: 'Kitchen pipe leaking under the sink. Water seeping out for 2 days.',
        subService:  'Leak Repair'
      },
      schedule: { date: daysFromNow(3), time: '10:00 AM', isEmergency: false },
      address:  { street: '12, Civil Lines', city: 'Kanpur', zipCode: '208001' },
      status:   'pending',
      pricing:  { basePrice: 500, totalPrice: 500 }
    });

    // 2. Accepted booking (professional assigned, chat active)
    const b2 = await Booking.create({
      customer: {
        name:   customer.name,
        email:  customer.email,
        phone:  customer.phone,
        userId: customer._id
      },
      service: {
        type:        'Cleaning',
        name:        'Home Deep Cleaning',
        description: 'Full home deep cleaning required before a family function.',
        subService:  'Deep Cleaning'
      },
      schedule: { date: daysFromNow(5), time: '09:00 AM', isEmergency: false },
      address:  { street: '12, Civil Lines', city: 'Kanpur', zipCode: '208001' },
      status:   'accepted',
      professional: {
        userId:     professional2._id,
        name:       professional2.name,
        phone:      professional2.phone,
        profession: professional2.profession,
        assignedAt: new Date()
      },
      pricing:  { basePrice: 1200, totalPrice: 1200 }
    });

    // 3. In-progress booking
    const b3 = await Booking.create({
      customer: {
        name:   customer.name,
        email:  customer.email,
        phone:  customer.phone,
        userId: customer._id
      },
      service: {
        type:        'Electrical',
        name:        'Fan Installation',
        description: 'Install 2 ceiling fans in bedroom and living room.',
        subService:  'Installation'
      },
      schedule: { date: daysFromNow(0), time: '11:00 AM', isEmergency: false },
      address:  { street: '12, Civil Lines', city: 'Kanpur', zipCode: '208001' },
      status:   'in-progress',
      professional: {
        userId:     professional._id,
        name:       professional.name,
        phone:      professional.phone,
        profession: 'Electrician',
        assignedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      pricing:  { basePrice: 800, totalPrice: 800 }
    });

    // 4. Completed booking with review
    const b4 = await Booking.create({
      customer: {
        name:   customer.name,
        email:  customer.email,
        phone:  customer.phone,
        userId: customer._id
      },
      service: {
        type:        'Plumbing',
        name:        'Bathroom Fixture Repair',
        description: 'Shower head replacement and tap tightening.',
        subService:  'Fixture Repair'
      },
      schedule: { date: daysFromNow(-7), time: '02:00 PM', isEmergency: false },
      address:  { street: '12, Civil Lines', city: 'Kanpur', zipCode: '208001' },
      status:   'completed',
      professional: {
        userId:     professional._id,
        name:       professional.name,
        phone:      professional.phone,
        profession: professional.profession,
        assignedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
      },
      pricing:   { basePrice: 650, totalPrice: 650 },
      review:    { rating: 5, comment: 'Excellent work! Very professional and on time.', reviewedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    });

    // 5. Cancelled booking
    await Booking.create({
      customer: {
        name:   customer.name,
        email:  customer.email,
        phone:  customer.phone,
        userId: customer._id
      },
      service: {
        type:        'Painting',
        name:        'Room Painting',
        description: 'Paint one bedroom with two coats.',
        subService:  'Interior Painting'
      },
      schedule: { date: daysFromNow(-3), time: '08:00 AM', isEmergency: false },
      address:  { street: '12, Civil Lines', city: 'Kanpur', zipCode: '208001' },
      status:          'cancelled',
      cancellationReason: 'Plan changed.',
      cancelledAt:     new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    });

    /* ---- chat threads --------------------------------------------- */

    // Thread for accepted booking (b2) – customer ↔ professional2
    const now = Date.now();
    await ChatThread.create({
      bookingId:      b2._id,
      customerId:     customer._id,
      professionalId: professional2._id,
      messages: [
        {
          sender:  { userId: customer._id,      name: customer.name,      userType: 'customer'     },
          text:    'Hi! Just wanted to confirm the deep cleaning appointment for next week.',
          sentAt:  new Date(now - 60 * 60 * 1000)
        },
        {
          sender:  { userId: professional2._id, name: professional2.name, userType: 'professional' },
          text:    'Hello! Yes, confirmed. I will bring all the equipment.',
          sentAt:  new Date(now - 55 * 60 * 1000)
        },
        {
          sender:  { userId: customer._id,      name: customer.name,      userType: 'customer'     },
          text:    'Great! Should I keep the rooms clear beforehand?',
          sentAt:  new Date(now - 50 * 60 * 1000)
        },
        {
          sender:  { userId: professional2._id, name: professional2.name, userType: 'professional' },
          text:    'Yes please, especially kitchen and bathroom areas. Makes the job faster.',
          sentAt:  new Date(now - 45 * 60 * 1000)
        }
      ],
      lastMessage: {
        text:     'Yes please, especially kitchen and bathroom areas. Makes the job faster.',
        senderId: professional2._id,
        sentAt:   new Date(now - 45 * 60 * 1000)
      },
      unreadCounts: { customer: 1, professional: 0, admin: 0 }
    });

    // Thread for in-progress booking (b3) – customer ↔ professional
    await ChatThread.create({
      bookingId:      b3._id,
      customerId:     customer._id,
      professionalId: professional._id,
      messages: [
        {
          sender:  { userId: professional._id, name: professional.name, userType: 'professional' },
          text:    'I am on the way. Will reach in about 20 minutes.',
          sentAt:  new Date(now - 30 * 60 * 1000)
        },
        {
          sender:  { userId: customer._id,     name: customer.name,     userType: 'customer'     },
          text:    'Okay, the door is open. Please ring the bell.',
          sentAt:  new Date(now - 25 * 60 * 1000)
        },
        {
          sender:  { userId: professional._id, name: professional.name, userType: 'professional' },
          text:    'Reached! Starting with the bedroom fan first.',
          sentAt:  new Date(now - 10 * 60 * 1000)
        }
      ],
      lastMessage: {
        text:     'Reached! Starting with the bedroom fan first.',
        senderId: professional._id,
        sentAt:   new Date(now - 10 * 60 * 1000)
      },
      unreadCounts: { customer: 1, professional: 0, admin: 0 }
    });

    // Thread for completed booking (b4) – customer ↔ professional
    await ChatThread.create({
      bookingId:      b4._id,
      customerId:     customer._id,
      professionalId: professional._id,
      messages: [
        {
          sender:  { userId: customer._id,     name: customer.name,     userType: 'customer'     },
          text:    'The bathroom looks great! Thanks for the quick service.',
          sentAt:  new Date(now - 7 * 24 * 60 * 60 * 1000)
        },
        {
          sender:  { userId: professional._id, name: professional.name, userType: 'professional' },
          text:    'Glad to help! Let me know if anything else needs attention.',
          sentAt:  new Date(now - 7 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000)
        }
      ],
      lastMessage: {
        text:     'Glad to help! Let me know if anything else needs attention.',
        senderId: professional._id,
        sentAt:   new Date(now - 7 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000)
      },
      unreadCounts: { customer: 0, professional: 0, admin: 0 }
    });

    /* ---- pending booking thread (no professional yet) ------------- */
    await ChatThread.create({
      bookingId:  b1._id,
      customerId: customer._id,
      messages: [
        {
          sender: { userId: customer._id, name: customer.name, userType: 'customer' },
          text:   'Booked pipe leak repair. Waiting for a professional to be assigned.',
          sentAt: new Date(now - 2 * 60 * 60 * 1000)
        }
      ],
      lastMessage: {
        text:    'Booked pipe leak repair. Waiting for a professional to be assigned.',
        senderId: customer._id,
        sentAt:  new Date(now - 2 * 60 * 60 * 1000)
      },
      unreadCounts: { customer: 0, professional: 0, admin: 0 }
    });

    /* ---------------------------------------------------------------- */
    console.log('✅  Demo data seeded successfully!');
    console.log('\n  Demo login credentials:');
    console.log('  ┌──────────────────────────────────────────────────────┐');
    console.log('  │  Customer     : customer@demo.com  / Demo@1234       │');
    console.log('  │  Professional : pro@demo.com       / Demo@1234       │');
    console.log('  │  Professional : pro2@demo.com      / Demo@1234       │');
    console.log('  └──────────────────────────────────────────────────────┘\n');

  } catch (error) {
    console.error('Demo seed error (non-fatal):', error.message);
  }
};

module.exports = seedDemoData;
