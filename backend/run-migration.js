const pool = require('./config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    const client = await pool.connect();

    try {
        const migrationSQL = fs.readFileSync(
            path.join(__dirname, 'migrations', 'add_enhanced_features.sql'),
            'utf8'
        );

        console.log('Running migration...');
        await client.query(migrationSQL);
        console.log('✅ Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration().catch(err => {
    console.error(err);
    process.exit(1);
});
