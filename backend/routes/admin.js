const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Contact = require('../models/Contact');
const FAQ = require('../models/FAQ');
const Newsletter = require('../models/Newsletter');
const Report = require('../models/Report');

const router = express.Router();

const professionToServiceType = {
	Plumber: 'Plumbing',
	Electrician: 'Electrical',
	Carpenter: 'Carpentry',
	Cleaner: 'Cleaning',
	Painter: 'Painting',
	'HVAC Technician': 'HVAC',
	'Moving Specialist': 'Moving',
	Gardener: 'Gardening',
	Tutor: 'Tutoring',
	Handyman: 'Handyman'
};

const verifyAdmin = async (req, res, next) => {
	try {
		const token = req.headers.authorization?.split(' ')[1];

		if (!token) {
			return res.status(401).json({ success: false, message: 'No token provided' });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET || 'karyon_secret_key');
		const user = await User.findById(decoded.id);

		if (!user || user.role !== 'admin') {
			return res.status(403).json({ success: false, message: 'Admin access required' });
		}

		req.user = user;
		return next();
	} catch (error) {
		return res.status(401).json({ success: false, message: 'Invalid or expired token' });
	}
};

const normalizePagination = (page, limit) => {
	const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
	const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
	return { pageNumber, limitNumber };
};

// @route GET /api/admin/dashboard
// @desc Admin dashboard analytics
// @access Admin
router.get('/dashboard', verifyAdmin, async (req, res) => {
	try {
		const [
			totalUsers,
			totalCustomers,
			totalProfessionals,
			activeProfessionals,
			totalBookings,
			unassignedBookings,
			pendingBookings,
			inProgressBookings,
			completedBookings,
			openReports,
			totalReports,
			totalContacts,
			totalFaqs,
			totalNewsletters,
			recentBookings,
			recentReports
		] = await Promise.all([
			User.countDocuments(),
			User.countDocuments({ userType: 'customer' }),
			User.countDocuments({ userType: 'professional' }),
			User.countDocuments({ userType: 'professional', isActive: true }),
			Booking.countDocuments(),
			Booking.countDocuments({ status: 'pending', 'professional.userId': { $exists: false } }),
			Booking.countDocuments({ status: 'pending' }),
			Booking.countDocuments({ status: 'in-progress' }),
			Booking.countDocuments({ status: 'completed' }),
			Report.countDocuments({ status: { $in: ['open', 'in-review'] } }),
			Report.countDocuments(),
			Contact.countDocuments(),
			FAQ.countDocuments(),
			Newsletter.countDocuments(),
			Booking.find().sort({ createdAt: -1 }).limit(8),
			Report.find().sort({ createdAt: -1 }).limit(8)
		]);

		return res.json({
			success: true,
			data: {
				stats: {
					totalUsers,
					totalCustomers,
					totalProfessionals,
					activeProfessionals,
					totalBookings,
					unassignedBookings,
					pendingBookings,
					inProgressBookings,
					completedBookings,
					openReports,
					totalReports,
					totalContacts,
					totalFaqs,
					totalNewsletters
				},
				recentBookings,
				recentReports
			}
		});
	} catch (error) {
		console.error('Admin dashboard error:', error);
		return res.status(500).json({ success: false, message: 'Failed to fetch dashboard data' });
	}
});

// @route GET /api/admin/bookings/unassigned
// @desc List bookings that are still unassigned
// @access Admin
router.get('/bookings/unassigned', verifyAdmin, async (req, res) => {
	try {
		const { page = 1, limit = 20, serviceType = '' } = req.query;
		const { pageNumber, limitNumber } = normalizePagination(page, limit);
		const query = {
			status: 'pending',
			'professional.userId': { $exists: false }
		};

		if (serviceType) {
			query['service.type'] = serviceType;
		}

		const [bookings, total] = await Promise.all([
			Booking.find(query)
				.sort({ createdAt: -1 })
				.skip((pageNumber - 1) * limitNumber)
				.limit(limitNumber),
			Booking.countDocuments(query)
		]);

		return res.json({
			success: true,
			data: bookings,
			pagination: {
				total,
				pages: Math.ceil(total / limitNumber),
				currentPage: pageNumber,
				limit: limitNumber
			}
		});
	} catch (error) {
		console.error('Admin unassigned bookings error:', error);
		return res.status(500).json({ success: false, message: 'Failed to fetch unassigned bookings' });
	}
});

// @route GET /api/admin/professionals/assignable
// @desc List professionals assignable for a service
// @access Admin
router.get('/professionals/assignable', verifyAdmin, async (req, res) => {
	try {
		const { serviceType = '' } = req.query;
		const query = { userType: 'professional', isActive: true };

		if (serviceType) {
			const professionList = Object.entries(professionToServiceType)
				.filter(([, mappedServiceType]) => mappedServiceType === serviceType)
				.map(([profession]) => profession);

			if (professionList.length) {
				query.profession = { $in: professionList };
			}
		}

		const professionals = await User.find(query)
			.select('_id name email phone profession experience skills hourlyRate isActive')
			.sort({ createdAt: -1 })
			.limit(200);

		return res.json({ success: true, data: professionals });
	} catch (error) {
		console.error('Admin assignable professionals error:', error);
		return res.status(500).json({ success: false, message: 'Failed to fetch professionals' });
	}
});

// @route PUT /api/admin/bookings/:id/assign
// @desc Assign an unassigned booking to a professional
// @access Admin
router.put('/bookings/:id/assign', verifyAdmin, async (req, res) => {
	try {
		const { professionalId } = req.body;

		if (!professionalId) {
			return res.status(400).json({ success: false, message: 'professionalId is required' });
		}

		const [booking, professional] = await Promise.all([
			Booking.findById(req.params.id),
			User.findById(professionalId)
		]);

		if (!booking) {
			return res.status(404).json({ success: false, message: 'Booking not found' });
		}

		if (!professional || professional.userType !== 'professional') {
			return res.status(404).json({ success: false, message: 'Professional not found' });
		}

		if (!professional.isActive) {
			return res.status(400).json({ success: false, message: 'Professional account is inactive' });
		}

		if (booking.professional?.userId) {
			return res.status(400).json({ success: false, message: 'Booking is already assigned' });
		}

		booking.professional = {
			userId: professional._id,
			name: professional.name,
			phone: professional.phone,
			profession: professional.profession,
			assignedAt: new Date()
		};
		booking.status = 'accepted';
		booking.acceptedAt = new Date();

		await booking.save();

		return res.json({
			success: true,
			message: 'Booking assigned successfully',
			data: booking
		});
	} catch (error) {
		console.error('Admin assign booking error:', error);
		return res.status(500).json({ success: false, message: 'Failed to assign booking' });
	}
});

// @route PUT /api/admin/bookings/:id/unassign
// @desc Unassign a booking from professional
// @access Admin
router.put('/bookings/:id/unassign', verifyAdmin, async (req, res) => {
	try {
		const booking = await Booking.findById(req.params.id);

		if (!booking) {
			return res.status(404).json({ success: false, message: 'Booking not found' });
		}

		if (!booking.professional?.userId) {
			return res.status(400).json({ success: false, message: 'Booking is not assigned' });
		}

		booking.professional = undefined;
		booking.status = 'pending';
		booking.acceptedAt = undefined;
		await booking.save();

		return res.json({ success: true, message: 'Booking unassigned successfully', data: booking });
	} catch (error) {
		console.error('Admin unassign booking error:', error);
		return res.status(500).json({ success: false, message: 'Failed to unassign booking' });
	}
});

// @route GET /api/admin/users
// @desc Admin user/professional management list
// @access Admin
router.get('/users', verifyAdmin, async (req, res) => {
	try {
		const { page = 1, limit = 20, userType = '', status = '', search = '' } = req.query;
		const { pageNumber, limitNumber } = normalizePagination(page, limit);

		const query = {};
		if (userType) query.userType = userType;
		if (status === 'active') query.isActive = true;
		if (status === 'inactive') query.isActive = false;
		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: 'i' } },
				{ email: { $regex: search, $options: 'i' } },
				{ phone: { $regex: search, $options: 'i' } }
			];
		}

		const [users, total] = await Promise.all([
			User.find(query)
				.select('-password -phoneOtp -phoneOtpExpire -resetPasswordToken -resetPasswordExpire')
				.sort({ createdAt: -1 })
				.skip((pageNumber - 1) * limitNumber)
				.limit(limitNumber),
			User.countDocuments(query)
		]);

		return res.json({
			success: true,
			data: users,
			pagination: {
				total,
				pages: Math.ceil(total / limitNumber),
				currentPage: pageNumber,
				limit: limitNumber
			}
		});
	} catch (error) {
		console.error('Admin get users error:', error);
		return res.status(500).json({ success: false, message: 'Failed to fetch users' });
	}
});

// @route PUT /api/admin/users/:id/status
// @desc Activate/deactivate user
// @access Admin
router.put('/users/:id/status', verifyAdmin, async (req, res) => {
	try {
		const { isActive } = req.body;
		if (typeof isActive !== 'boolean') {
			return res.status(400).json({ success: false, message: 'isActive must be boolean' });
		}

		const target = await User.findById(req.params.id);
		if (!target) {
			return res.status(404).json({ success: false, message: 'User not found' });
		}

		if (String(target._id) === String(req.user._id) && !isActive) {
			return res.status(400).json({ success: false, message: 'You cannot deactivate your own admin account' });
		}

		target.isActive = isActive;
		await target.save();

		return res.json({ success: true, message: 'User status updated successfully', data: target });
	} catch (error) {
		console.error('Admin update user status error:', error);
		return res.status(500).json({ success: false, message: 'Failed to update user status' });
	}
});

// @route GET /api/admin/reports
// @desc List submitted reports for moderation
// @access Admin
router.get('/reports', verifyAdmin, async (req, res) => {
	try {
		const { page = 1, limit = 20, status = '', targetType = '' } = req.query;
		const { pageNumber, limitNumber } = normalizePagination(page, limit);

		const query = {};
		if (status) query.status = status;
		if (targetType) query['target.userType'] = targetType;

		const [reports, total] = await Promise.all([
			Report.find(query)
				.sort({ createdAt: -1 })
				.skip((pageNumber - 1) * limitNumber)
				.limit(limitNumber),
			Report.countDocuments(query)
		]);

		return res.json({
			success: true,
			data: reports,
			pagination: {
				total,
				pages: Math.ceil(total / limitNumber),
				currentPage: pageNumber,
				limit: limitNumber
			}
		});
	} catch (error) {
		console.error('Admin get reports error:', error);
		return res.status(500).json({ success: false, message: 'Failed to fetch reports' });
	}
});

// @route PUT /api/admin/reports/:id/review
// @desc Update report status and moderation action
// @access Admin
router.put('/reports/:id/review', verifyAdmin, async (req, res) => {
	try {
		const { status, note = '', action = 'none' } = req.body;

		const report = await Report.findById(req.params.id);
		if (!report) {
			return res.status(404).json({ success: false, message: 'Report not found' });
		}

		if (status) {
			report.status = status;
		}

		report.adminReview = {
			reviewedBy: req.user._id,
			note,
			actionTaken: action,
			reviewedAt: new Date()
		};

		if (action === 'suspended' || action === 'reactivated') {
			const targetUser = await User.findById(report.target.userId);
			if (targetUser) {
				targetUser.isActive = action !== 'suspended';
				await targetUser.save();
			}
		}

		await report.save();

		return res.json({ success: true, message: 'Report reviewed successfully', data: report });
	} catch (error) {
		console.error('Admin review report error:', error);
		return res.status(500).json({ success: false, message: 'Failed to review report' });
	}
});

module.exports = router;
