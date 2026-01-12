const pool = require('../config/db');

/**
 * Migration: Add accepted_at column to blood_requests
 * This migration is safe - only adds new column without affecting existing data
 */
const migrate = async () => {
  console.log('Running migration: add-blood-request-workflow...');
  
  try {
    // Add accepted_at column
    await pool.query(`
      ALTER TABLE blood_requests 
      ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP
    `);
    console.log('✅ Added accepted_at column to blood_requests');

    // Add donation_source column to donations table (for tracking appointment vs request donations)
    await pool.query(`
      ALTER TABLE donations 
      ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'blood_request'
    `);
    console.log('✅ Added source column to donations');

    // Add appointment_id column to donations table for linking appointment donations
    await pool.query(`
      ALTER TABLE donations 
      ADD COLUMN IF NOT EXISTS appointment_id INTEGER
    `);
    console.log('✅ Added appointment_id column to donations');

    console.log('\\n✅ Migration completed successfully!');
    return true;
  } catch (error) {
    console.error('Migration error:', error.message);
    return false;
  }
};

module.exports = { migrate };

// Run if called directly
if (require.main === module) {
  migrate().then(success => {
    process.exit(success ? 0 : 1);
  });
}
