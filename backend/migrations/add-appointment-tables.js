/**
 * Migration: Create appointment tables for blood bank booking system
 * Safe migration that doesn't delete existing data
 */
const pool = require('../config/db');

const runMigration = async () => {
  try {
    console.log('Starting migration: Creating appointment tables...');

    // Create default_appointment_slots table for blood bank default schedule
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
    console.log('✅ Created default_appointment_slots table');

    // Create appointment_slots table for specific date slots (overrides for defaults)
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
    console.log('✅ Created appointment_slots table');

    // Create appointments table for user bookings
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
    console.log('✅ Created appointments table');

    // Create indexes for faster queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_default_slots_bank ON default_appointment_slots(blood_bank_id);
      CREATE INDEX IF NOT EXISTS idx_slots_bank_date ON appointment_slots(blood_bank_id, slot_date);
      CREATE INDEX IF NOT EXISTS idx_appointments_user ON appointments(user_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_bank ON appointments(blood_bank_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
      CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
    `);
    console.log('✅ Created indexes for appointment tables');

    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
