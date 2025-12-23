const pool = require('../config/database');
const { validationResult } = require('express-validator');

// @route   POST /api/jobs
// @desc    Create a new job posting
// @access  Private (Recruiters only)
const createJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      description,
      requirements,
      location,
      jobType,
      salaryMin,
      salaryMax,
      remoteOk
    } = req.body;

    const result = await pool.query(
      `INSERT INTO jobs (
        recruiter_id, title, company, description, requirements,
        location, job_type, salary_min, salary_max, remote_ok
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        req.user.id,
        title,
        company || req.user.company_name,
        description,
        requirements || null,
        location,
        jobType,
        salaryMin || null,
        salaryMax || null,
        remoteOk || false
      ]
    );

    const job = result.rows[0];

    res.status(201).json({
      message: 'Job created successfully',
      job: formatJob(job)
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Server error while creating job.' });
  }
};

// @route   GET /api/jobs
// @desc    Get all open jobs (with optional filters)
// @access  Public
const getJobs = async (req, res) => {
  try {
    const {
      search,
      jobType,
      location,
      remoteOk,
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;
    const params = [];
    let paramIndex = 1;

    let query = `
      SELECT j.*, u.first_name, u.last_name, u.company_name as recruiter_company,
             COUNT(a.id) as application_count
      FROM jobs j
      LEFT JOIN users u ON j.recruiter_id = u.id
      LEFT JOIN applications a ON j.id = a.job_id
      WHERE j.status = 'open'
    `;

    // Search filter
    if (search) {
      query += ` AND (j.title ILIKE $${paramIndex} OR j.company ILIKE $${paramIndex} OR j.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Job type filter
    if (jobType) {
      query += ` AND j.job_type = $${paramIndex}`;
      params.push(jobType);
      paramIndex++;
    }

    // Location filter
    if (location) {
      query += ` AND j.location ILIKE $${paramIndex}`;
      params.push(`%${location}%`);
      paramIndex++;
    }

    // Remote filter
    if (remoteOk === 'true') {
      query += ` AND j.remote_ok = true`;
    }

    query += ` GROUP BY j.id, u.id`;
    query += ` ORDER BY j.created_at DESC`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) FROM jobs j WHERE j.status = 'open'`;
    const countParams = [];
    let countParamIndex = 1;

    if (search) {
      countQuery += ` AND (j.title ILIKE $${countParamIndex} OR j.company ILIKE $${countParamIndex} OR j.description ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }
    if (jobType) {
      countQuery += ` AND j.job_type = $${countParamIndex}`;
      countParams.push(jobType);
      countParamIndex++;
    }
    if (location) {
      countQuery += ` AND j.location ILIKE $${countParamIndex}`;
      countParams.push(`%${location}%`);
      countParamIndex++;
    }
    if (remoteOk === 'true') {
      countQuery += ` AND j.remote_ok = true`;
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      jobs: result.rows.map(formatJobWithRecruiter),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Server error while fetching jobs.' });
  }
};

// @route   GET /api/jobs/my-jobs
// @desc    Get all jobs posted by the current recruiter
// @access  Private (Recruiters only)
const getMyJobs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT j.*, COUNT(a.id) as application_count
       FROM jobs j
       LEFT JOIN applications a ON j.id = a.job_id
       WHERE j.recruiter_id = $1
       GROUP BY j.id
       ORDER BY j.created_at DESC`,
      [req.user.id]
    );

    res.json({
      jobs: result.rows.map(formatJob)
    });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({ error: 'Server error while fetching your jobs.' });
  }
};

// @route   GET /api/jobs/:id
// @desc    Get a single job by ID
// @access  Public
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT j.*, u.first_name, u.last_name, u.company_name as recruiter_company,
              u.email as recruiter_email, COUNT(a.id) as application_count
       FROM jobs j
       LEFT JOIN users u ON j.recruiter_id = u.id
       LEFT JOIN applications a ON j.id = a.job_id
       WHERE j.id = $1
       GROUP BY j.id, u.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    res.json({
      job: formatJobWithRecruiter(result.rows[0])
    });
  } catch (error) {
    console.error('Get job by ID error:', error);
    res.status(500).json({ error: 'Server error while fetching job.' });
  }
};

// @route   PUT /api/jobs/:id
// @desc    Update a job posting
// @access  Private (Recruiter who owns the job)
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      company,
      description,
      requirements,
      location,
      jobType,
      salaryMin,
      salaryMax,
      remoteOk,
      status
    } = req.body;

    // Check if job exists and belongs to user
    const existingJob = await pool.query(
      'SELECT * FROM jobs WHERE id = $1',
      [id]
    );

    if (existingJob.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    if (existingJob.rows[0].recruiter_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this job.' });
    }

    const result = await pool.query(
      `UPDATE jobs SET
        title = COALESCE($1, title),
        company = COALESCE($2, company),
        description = COALESCE($3, description),
        requirements = COALESCE($4, requirements),
        location = COALESCE($5, location),
        job_type = COALESCE($6, job_type),
        salary_min = COALESCE($7, salary_min),
        salary_max = COALESCE($8, salary_max),
        remote_ok = COALESCE($9, remote_ok),
        status = COALESCE($10, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *`,
      [title, company, description, requirements, location, jobType, salaryMin, salaryMax, remoteOk, status, id]
    );

    res.json({
      message: 'Job updated successfully',
      job: formatJob(result.rows[0])
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Server error while updating job.' });
  }
};

// @route   DELETE /api/jobs/:id
// @desc    Delete a job posting
// @access  Private (Recruiter who owns the job)
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if job exists and belongs to user
    const existingJob = await pool.query(
      'SELECT * FROM jobs WHERE id = $1',
      [id]
    );

    if (existingJob.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    if (existingJob.rows[0].recruiter_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this job.' });
    }

    await pool.query('DELETE FROM jobs WHERE id = $1', [id]);

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Server error while deleting job.' });
  }
};

// Helper function to format job response
const formatJob = (job) => ({
  id: job.id,
  recruiterId: job.recruiter_id,
  title: job.title,
  company: job.company,
  description: job.description,
  requirements: job.requirements,
  location: job.location,
  jobType: job.job_type,
  salaryMin: job.salary_min,
  salaryMax: job.salary_max,
  status: job.status,
  remoteOk: job.remote_ok,
  applicationCount: parseInt(job.application_count) || 0,
  createdAt: job.created_at,
  updatedAt: job.updated_at
});

const formatJobWithRecruiter = (job) => ({
  ...formatJob(job),
  recruiter: {
    firstName: job.first_name,
    lastName: job.last_name,
    company: job.recruiter_company,
    email: job.recruiter_email
  }
});

module.exports = {
  createJob,
  getJobs,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob
};
