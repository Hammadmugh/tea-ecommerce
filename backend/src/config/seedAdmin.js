import bcryptjs from 'bcryptjs';
import User from '../models/userModel.js';

export const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash('12345678', salt);

    // Create admin user
    const admin = new User({
      name: 'Hammad Afzal',
      email: 'hammad@gmail.com',
      password: hashedPassword,
      role: 'superadmin',
      isBlocked: false
    });

    await admin.save();
    console.log('✅ Default admin user created successfully');
  } catch (err) {
    console.error('❌ Error seeding admin user:', err.message);
  }
};
