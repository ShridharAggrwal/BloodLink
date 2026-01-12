/**
 * Run all migrations for new features
 * This script runs all migrations safely without deleting existing data
 */
const pool = require('./config/db');

const runAllMigrations = async () => {
  console.log('🚀 Starting BloodLink migrations...\n');

  try {
    // Migration 1: Add profile image columns
    console.log('📷 Migration 1: Adding profile image columns...');
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
    `);
    await pool.query(`
      ALTER TABLE ngos ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
    `);
    await pool.query(`
      ALTER TABLE blood_banks ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
    `);
    console.log('  ✅ Added profile_image_url to users, ngos, blood_banks\n');

    // Migration 2: Add prescription image column
    console.log('📋 Migration 2: Adding prescription image column...');
    await pool.query(`
      ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS prescription_image_url TEXT;
    `);
    console.log('  ✅ Added prescription_image_url to blood_requests\n');

    // Migration 3: Create appointment tables
    console.log('📅 Migration 3: Creating appointment tables...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS default_appointment_slots (
        id SERIAL PRIMARY KEY,
        blood_bank_id INTEGER REFERENCES blood_banks(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        max_bookings INTEGER DEFAULT 5,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(blood_bank_id, day_of_week, start_time)
      );
    `);
    console.log('  ✅ Created default_appointment_slots table');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointment_slots (
        id SERIAL PRIMARY KEY,
        blood_bank_id INTEGER REFERENCES blood_banks(id) ON DELETE CASCADE,
        slot_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        max_bookings INTEGER DEFAULT 5,
        current_bookings INTEGER DEFAULT 0,
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(blood_bank_id, slot_date, start_time)
      );
    `);
    console.log('  ✅ Created appointment_slots table');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        slot_id INTEGER REFERENCES appointment_slots(id) ON DELETE CASCADE,
        blood_bank_id INTEGER REFERENCES blood_banks(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        user_name VARCHAR(100) NOT NULL,
        user_email VARCHAR(100) NOT NULL,
        user_phone VARCHAR(20),
        blood_group VARCHAR(5) NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ Created appointments table');

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_default_slots_bank ON default_appointment_slots(blood_bank_id);
      CREATE INDEX IF NOT EXISTS idx_slots_bank_date ON appointment_slots(blood_bank_id, slot_date);
      CREATE INDEX IF NOT EXISTS idx_appointments_user ON appointments(user_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_bank ON appointments(blood_bank_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
      CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
    `);
    console.log('  ✅ Created indexes for appointment tables\n');

    // Migration 4: Blood request workflow enhancements
    console.log('🩸 Migration 4: Adding blood request workflow columns...');
    await pool.query(`
      ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP;
    `);
    console.log('  ✅ Added accepted_at to blood_requests');

    await pool.query(`
      ALTER TABLE donations ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'blood_request';
    `);
    console.log('  ✅ Added source column to donations');

    await pool.query(`
      ALTER TABLE donations ADD COLUMN IF NOT EXISTS appointment_id INTEGER;
    `);
    console.log('  ✅ Added appointment_id to donations\n');

    // Migration 5: Blood request cancel reason
    console.log('🩸 Migration 5: Adding cancel reason columns...');
    await pool.query(`
      ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS cancel_reason TEXT;
    `);
    console.log('  ✅ Added cancel_reason to blood_requests');

    await pool.query(`
      ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS last_cancel_reason TEXT;
    `);
    console.log('  ✅ Added last_cancel_reason to blood_requests');

    await pool.query(`
      ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS last_cancelled_by_name VARCHAR(255);
    `);
    console.log('  ✅ Added last_cancelled_by_name to blood_requests\n');


    console.log('═══════════════════════════════════════════════════');
    console.log('🎉 All migrations completed successfully!');
    console.log('═══════════════════════════════════════════════════\n');
    
    console.log('Next steps:');
    console.log('1. Add GEMINI_API_KEY to your .env file');
    console.log('2. Add Firebase config to frontend .env file');
    console.log('3. Restart your backend server\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
};

runAllMigrations();
