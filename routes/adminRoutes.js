const express = require('express');
const router = express.Router();
const { getStats, getAllBookings, getUsers, updateUserRole } = require('../controllers/adminController');
const { protect, requireRole } = require('../middleware/authMiddleware');

// Everything under /api/admin requires a logged-in admin.
router.use(protect, requireRole('admin'));

router.get('/stats', getStats);
router.get('/bookings', getAllBookings);
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);

module.exports = router;
