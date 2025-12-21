const pool = require('./database');

const initializeDatabase = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Create enum for user roles
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('student', 'recruiter');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create enum for job types
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE job_type AS ENUM ('full-time', 'part-time', 'internship', 'contract');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create enum for job status
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE job_status AS ENUM ('open', 'closed', 'paused');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create enum for application status
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'interviewing', 'rejected', 'accepted');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role user_role NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        company_name VARCHAR(255),
        bio TEXT,
        location VARCHAR(255),
        website VARCHAR(255),
        linkedin VARCHAR(255),
        github VARCHAR(255),
        resume_url VARCHAR(500),
        profile_image_url VARCHAR(500),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create jobs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        recruiter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT,
        location VARCHAR(255) NOT NULL,
        job_type job_type NOT NULL,
        salary_min INTEGER,
        salary_max INTEGER,
        status job_status DEFAULT 'open',
        remote_ok BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create applications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
        student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        cover_letter TEXT,
        resume_url VARCHAR(500),
        status application_status DEFAULT 'pending',
        recruiter_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(job_id, student_id)
      );
    `);

    // Create indexes for better query performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_id ON jobs(recruiter_id);
      CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
      CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);
      CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
      CREATE INDEX IF NOT EXISTS idx_applications_student_id ON applications(student_id);
      CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
    `);

    await client.query('COMMIT');
    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = initializeDatabase;
