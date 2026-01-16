/**
 * Migration: Add dob column to users table and backfill existing users
 */
const pool = require('../config/db');

const runMigration = async () => {
  try {
    console.log('Starting migration: Adding dob column...');

    // Add dob column to users table
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS dob DATE;
    `);
    console.log('✅ Added dob column to users table');

    // Backfill existing users with a default DOB (21 years ago)
    // Using simple string interpolation for interval might be risky with prepared statements in some drivers, 
    // but Postgres supports interval syntax directly.
    // We want exactly 21 years ago from today.
    await pool.query(`
      UPDATE users 
      SET dob = CURRENT_DATE - INTERVAL '21 years' 
      WHERE dob IS NULL;
    `);
    console.log('✅ Backfilled existing users with default DOB (21 years old)');

    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
