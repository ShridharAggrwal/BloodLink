/**
 * Migration: Add prescription image URL column to blood_requests table
 * Safe migration that doesn't delete existing data
 */
const pool = require('../config/db');

const runMigration = async () => {
  try {
    console.log('Starting migration: Adding prescription_image_url column...');

    // Add prescription_image_url to blood_requests table
    await pool.query(`
      ALTER TABLE blood_requests 
      ADD COLUMN IF NOT EXISTS prescription_image_url TEXT;
    `);
    console.log('✅ Added prescription_image_url to blood_requests table');

    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
