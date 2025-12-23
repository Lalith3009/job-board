const pool = require('../config/database');
const { validationResult } = require('express-validator');

// @route   POST /api/jobs/:jobId/apply
// @desc    Apply to a job
// @access  Private (Students only)
const applyToJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { jobId } = req.params;
    const { coverLetter } = req.body;
    const studentId = req.user.id;

    // Check if job exists and is open
    const jobResult = await pool.query(
      'SELECT * FROM jobs WHERE id = $1',
      [jobId]
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    if (jobResult.rows[0].status !== 'open') {
      return res.status(400).json({ error: 'This job is no longer accepting applications.' });
    }

    // Check if already applied
    const existingApplication = await pool.query(
      'SELECT * FROM applications WHERE job_id = $1 AND student_id = $2',
      [jobId, studentId]
    );

    if (existingApplication.rows.length > 0) {
      return res.status(400).json({ error: 'You have already applied to this job.' });
    }

    // Get student's resume URL from profile
    const studentResult = await pool.query(
      'SELECT resume_url FROM users WHERE id = $1',
      [studentId]
    );

    const resumeUrl = studentResult.rows[0]?.resume_url || null;

    // Create application
    const result = await pool.query(
      `INSERT INTO applications (job_id, student_id, cover_letter, resume_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [jobId, studentId, coverLetter || null, resumeUrl]
    );

    res.status(201).json({
      message: 'Application submitted successfully!',
      application: formatApplication(result.rows[0])
    });
  } catch (error) {
    console.error('Apply to job error:', error);
    res.status(500).json({ error: 'Server error while submitting application.' });
  }
};

// @route   GET /api/applications/my-applications
// @desc    Get all applications for the current student
// @access  Private (Students only)
const getMyApplications = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, 
              j.title as job_title, j.company, j.location, j.job_type, j.status as job_status,
              u.first_name as recruiter_first_name, u.last_name as recruiter_last_name
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN users u ON j.recruiter_id = u.id
       WHERE a.student_id = $1
       ORDER BY a.created_at DESC`,
      [req.user.id]
    );

    res.json({
      applications: result.rows.map(row => ({
        id: row.id,
        status: row.status,
        coverLetter: row.cover_letter,
        resumeUrl: row.resume_url,
        recruiterNotes: row.recruiter_notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        job: {
          id: row.job_id,
          title: row.job_title,
          company: row.company,
          location: row.location,
          jobType: row.job_type,
          status: row.job_status
        },
        recruiter: {
          firstName: row.recruiter_first_name,
          lastName: row.recruiter_last_name
        }
      }))
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ error: 'Server error while fetching applications.' });
  }
};

// @route   GET /api/applications/job/:jobId
// @desc    Get all applications for a specific job
// @access  Private (Recruiter who owns the job)
const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Verify job belongs to recruiter
    const jobResult = await pool.query(
      'SELECT * FROM jobs WHERE id = $1 AND recruiter_id = $2',
      [jobId, req.user.id]
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found or access denied.' });
    }

    const result = await pool.query(
      `SELECT a.*,
              u.first_name, u.last_name, u.email, u.location as student_location,
              u.linkedin, u.github, u.bio
       FROM applications a
       JOIN users u ON a.student_id = u.id
       WHERE a.job_id = $1
       ORDER BY a.created_at DESC`,
      [jobId]
    );

    res.json({
      job: {
        id: jobResult.rows[0].id,
        title: jobResult.rows[0].title,
        company: jobResult.rows[0].company
      },
      applications: result.rows.map(row => ({
        id: row.id,
        status: row.status,
        coverLetter: row.cover_letter,
        resumeUrl: row.resume_url,
        recruiterNotes: row.recruiter_notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        student: {
          id: row.student_id,
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email,
          location: row.student_location,
          linkedin: row.linkedin,
          github: row.github,
          bio: row.bio
        }
      }))
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({ error: 'Server error while fetching applications.' });
  }
};

// @route   GET /api/applications/recruiter/all
// @desc    Get all applications for all jobs owned by recruiter
// @access  Private (Recruiters only)
const getAllRecruiterApplications = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*,
              j.title as job_title, j.company,
              u.first_name, u.last_name, u.email
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN users u ON a.student_id = u.id
       WHERE j.recruiter_id = $1
       ORDER BY a.created_at DESC`,
      [req.user.id]
    );

    res.json({
      applications: result.rows.map(row => ({
        id: row.id,
        status: row.status,
        coverLetter: row.cover_letter,
        createdAt: row.created_at,
        job: {
          id: row.job_id,
          title: row.job_title,
          company: row.company
        },
        student: {
          id: row.student_id,
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email
        }
      }))
    });
  } catch (error) {
    console.error('Get all recruiter applications error:', error);
    res.status(500).json({ error: 'Server error while fetching applications.' });
  }
};

// @route   PUT /api/applications/:id/status
// @desc    Update application status
// @access  Private (Recruiter who owns the job)
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, recruiterNotes } = req.body;

    // Validate status
    const validStatuses = ['pending', 'reviewed', 'interviewing', 'rejected', 'accepted'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    // Get application and verify ownership
    const appResult = await pool.query(
      `SELECT a.*, j.recruiter_id
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.id = $1`,
      [id]
    );

    if (appResult.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    if (appResult.rows[0].recruiter_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this application.' });
    }

    const result = await pool.query(
      `UPDATE applications
       SET status = COALESCE($1, status),
           recruiter_notes = COALESCE($2, recruiter_notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, recruiterNotes, id]
    );

    res.json({
      message: 'Application updated successfully',
      application: formatApplication(result.rows[0])
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ error: 'Server error while updating application.' });
  }
};

// @route   DELETE /api/applications/:id
// @desc    Withdraw application
// @access  Private (Student who owns the application)
const withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const appResult = await pool.query(
      'SELECT * FROM applications WHERE id = $1 AND student_id = $2',
      [id, req.user.id]
    );

    if (appResult.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    await pool.query('DELETE FROM applications WHERE id = $1', [id]);

    res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({ error: 'Server error while withdrawing application.' });
  }
};

// @route   GET /api/applications/check/:jobId
// @desc    Check if student has applied to a job
// @access  Private (Students only)
const checkApplication = async (req, res) => {
  try {
    const { jobId } = req.params;

    const result = await pool.query(
      'SELECT * FROM applications WHERE job_id = $1 AND student_id = $2',
      [jobId, req.user.id]
    );

    res.json({
      hasApplied: result.rows.length > 0,
      application: result.rows.length > 0 ? formatApplication(result.rows[0]) : null
    });
  } catch (error) {
    console.error('Check application error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

// Helper function
const formatApplication = (app) => ({
  id: app.id,
  jobId: app.job_id,
  studentId: app.student_id,
  status: app.status,
  coverLetter: app.cover_letter,
  resumeUrl: app.resume_url,
  recruiterNotes: app.recruiter_notes,
  createdAt: app.created_at,
  updatedAt: app.updated_at
});

module.exports = {
  applyToJob,
  getMyApplications,
  getJobApplications,
  getAllRecruiterApplications,
  updateApplicationStatus,
  withdrawApplication,
  checkApplication
};
