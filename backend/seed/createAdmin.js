const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');
const User = require('../models/User');

const createOrPromoteAdmin = async () => {
	try {
		const adminEmail = (process.env.ADMIN_EMAIL || 'admin@karyon.app').toLowerCase();
		const adminPassword = process.env.ADMIN_PASSWORD || 'admin@123456';
		const adminName = process.env.ADMIN_NAME || 'Admin User';
		const adminPhone = process.env.ADMIN_PHONE || '9999999999';

		await connectDB();

		let admin = await User.findOne({ email: adminEmail }).select('+password');

		if (!admin) {
			admin = new User({
				name: adminName,
				email: adminEmail,
				phone: adminPhone,
				password: adminPassword,
				userType: 'customer',
				role: 'admin',
				isActive: true,
				isVerified: true,
				authProvider: 'local'
			});

			await admin.save();
			console.log('Admin user created successfully.');
		} else {
			admin.name = adminName;
			admin.phone = adminPhone;
			admin.password = adminPassword;
			admin.userType = 'customer';
			admin.role = 'admin';
			admin.isActive = true;
			admin.isVerified = true;
			admin.authProvider = 'local';

			await admin.save();
			console.log('Existing user promoted/updated as admin successfully.');
		}

		console.log(`Email: ${adminEmail}`);
		console.log(`Password: ${adminPassword}`);
		process.exit(0);
	} catch (error) {
		console.error('Failed to create admin:', error.message);
		process.exit(1);
	}
};

createOrPromoteAdmin();
