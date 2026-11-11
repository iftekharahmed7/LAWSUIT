const express = require('express');
const router = express.Router();
const { getMyProfile, getMyBookings, updateMyBookingStatus } = require('../controllers/lawyerPortalController');
const { protect, requireRole } = require('../middleware/authMiddleware');

// Everything under /api/lawyer-portal requires a logged-in lawyer account.
router.use(protect, requireRole('lawyer'));

router.get('/me', getMyProfile);
router.get('/bookings', getMyBookings);
router.patch('/bookings/:id/status', updateMyBookingStatus);

module.exports = router;
