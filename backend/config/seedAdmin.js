const pool = require('./db');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const existing = await pool.query('SELECT id FROM admins WHERE email = $1', ['admin@bloodlink.com']);
    
    if (existing.rows.length > 0) {
      console.log('Admin already exists');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    await pool.query(
      `INSERT INTO admins (name, email, password, age, gender, address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['Admin', 'admin@bloodlink.com', hashedPassword, 30, 'male', 'BloodLink HQ']
    );

    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@bloodlink.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();

