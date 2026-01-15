const pool = require('./db');

const initDatabase = async () => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        gender VARCHAR(10),
        blood_group VARCHAR(5),
        dob DATE,
        address TEXT,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        is_verified BOOLEAN DEFAULT FALSE,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table created');

    // Create admins table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        age INTEGER,
        gender VARCHAR(10),
        address TEXT,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Admins table created');

    // Create ngos table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ngos (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        owner_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        age INTEGER,
        gender VARCHAR(10),
        address TEXT,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        volunteer_count INTEGER DEFAULT 0,
        is_verified BOOLEAN DEFAULT TRUE,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ NGOs table created');

    // Create blood_banks table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blood_banks (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        contact_info VARCHAR(100),
        address TEXT,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        is_verified BOOLEAN DEFAULT TRUE,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Blood Banks table created');

    // Create blood_requests table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blood_requests (
        id SERIAL PRIMARY KEY,
        requester_id INTEGER NOT NULL,
        requester_type VARCHAR(20) NOT NULL,
        blood_group VARCHAR(5) NOT NULL,
        units_needed INTEGER DEFAULT 1,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        address TEXT,
        status VARCHAR(20) DEFAULT 'active',
        accepted_by INTEGER,
        accepted_by_type VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Blood Requests table created');

    // Create donations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS donations (
        id SERIAL PRIMARY KEY,
        donor_id INTEGER NOT NULL,
        donor_type VARCHAR(20) DEFAULT 'user',
        request_id INTEGER REFERENCES blood_requests(id),
        blood_group VARCHAR(5) NOT NULL,
        units INTEGER DEFAULT 1,
        donated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Donations table created');

    // Create campaigns table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id SERIAL PRIMARY KEY,
        ngo_id INTEGER REFERENCES ngos(id),
        title VARCHAR(200) NOT NULL,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        address TEXT,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Campaigns table created');

    // Create blood_stock table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blood_stock (
        id SERIAL PRIMARY KEY,
        blood_bank_id INTEGER REFERENCES blood_banks(id),
        blood_group VARCHAR(5) NOT NULL,
        units_available INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(blood_bank_id, blood_group)
      );
    `);
    console.log('✅ Blood Stock table created');

    // Create signup_tokens table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS signup_tokens (
        id SERIAL PRIMARY KEY,
        token VARCHAR(255) UNIQUE NOT NULL,
        type VARCHAR(20) NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        created_by INTEGER REFERENCES admins(id),
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Signup Tokens table created');

    // Create email_verifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_verifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        user_type VARCHAR(20) DEFAULT 'user',
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Email Verifications table created');

    // Create indexes for faster location queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_lat_lng ON users (latitude, longitude);
      CREATE INDEX IF NOT EXISTS idx_ngos_lat_lng ON ngos (latitude, longitude);
      CREATE INDEX IF NOT EXISTS idx_blood_banks_lat_lng ON blood_banks (latitude, longitude);
      CREATE INDEX IF NOT EXISTS idx_blood_requests_lat_lng ON blood_requests (latitude, longitude);
      CREATE INDEX IF NOT EXISTS idx_campaigns_lat_lng ON campaigns (latitude, longitude);
    `);
    console.log('✅ Location indexes created');

    console.log('\n🎉 Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initDatabase();
