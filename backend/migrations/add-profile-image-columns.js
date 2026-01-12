/**
 * Migration: Add profile image URL columns to users, ngos, and blood_banks tables
 * Safe migration that doesn't delete existing data
 */
const pool = require('../config/db');

const runMigration = async () => {
  try {
    console.log('Starting migration: Adding profile_image_url columns...');

    // Add profile_image_url to users table
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
    `);
    console.log('✅ Added profile_image_url to users table');

    // Add profile_image_url to ngos table
    await pool.query(`
      ALTER TABLE ngos 
      ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
    `);
    console.log('✅ Added profile_image_url to ngos table');

    // Add profile_image_url to blood_banks table
    await pool.query(`
      ALTER TABLE blood_banks 
      ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
    `);
    console.log('✅ Added profile_image_url to blood_banks table');

    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
