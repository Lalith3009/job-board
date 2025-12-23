const express = require('express');
const { body } = require('express-validator');
const {
  applyToJob,
  getMyApplications,
  getJobApplications,
  getAllRecruiterApplications,
  updateApplicationStatus,
  withdrawApplication,
  checkApplication
} = require('../controllers/applicationsController');
const { authenticate, isStudent, isRecruiter } = require('../middleware/auth');

const router = express.Router();

// Student routes
router.post(
  '/jobs/:jobId/apply',
  authenticate,
  isStudent,
  [
    body('coverLetter')
      .optional()
      .isLength({ max: 5000 })
      .withMessage('Cover letter must be less than 5000 characters')
  ],
  applyToJob
);

router.get('/my-applications', authenticate, isStudent, getMyApplications);
router.get('/check/:jobId', authenticate, isStudent, checkApplication);
router.delete('/:id', authenticate, isStudent, withdrawApplication);

// Recruiter routes
router.get('/recruiter/all', authenticate, isRecruiter, getAllRecruiterApplications);
router.get('/job/:jobId', authenticate, isRecruiter, getJobApplications);
router.put('/:id/status', authenticate, isRecruiter, updateApplicationStatus);

module.exports = router;
