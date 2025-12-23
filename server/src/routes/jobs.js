const express = require('express');
const { body } = require('express-validator');
const {
  createJob,
  getJobs,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob
} = require('../controllers/jobsController');
const { authenticate, isRecruiter } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const jobValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Job title is required')
    .isLength({ max: 255 })
    .withMessage('Title must be less than 255 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Job description is required'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('jobType')
    .isIn(['full-time', 'part-time', 'internship', 'contract'])
    .withMessage('Invalid job type')
];

// Public routes
router.get('/', getJobs);
router.get('/:id', getJobById);

// Protected routes (Recruiters only)
router.post('/', authenticate, isRecruiter, jobValidation, createJob);
router.get('/recruiter/my-jobs', authenticate, isRecruiter, getMyJobs);
router.put('/:id', authenticate, isRecruiter, updateJob);
router.delete('/:id', authenticate, isRecruiter, deleteJob);

module.exports = router;
