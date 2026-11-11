const express = require('express');
const router = express.Router();
const { getStats, getAllBookings, getUsers, updateUserRole } = require('../controllers/adminController');
const content = require('../controllers/adminContentController');
const { protect, requireRole } = require('../middleware/authMiddleware');

// Everything under /api/admin requires a logged-in admin.
router.use(protect, requireRole('admin'));

router.get('/stats', getStats);
router.get('/bookings', getAllBookings);
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);

// Edit and delete content. Creating content uses the existing public-facing
// routes (POST /api/lawyers, /api/documents, /api/glossary, /api/legal-news).
router.put('/lawyers/:id', content.lawyers.update);
router.delete('/lawyers/:id', content.lawyers.remove);
router.put('/documents/:id', content.documents.update);
router.delete('/documents/:id', content.documents.remove);
router.put('/glossary/:id', content.glossary.update);
router.delete('/glossary/:id', content.glossary.remove);
router.put('/legal-news/:id', content.news.update);
router.delete('/legal-news/:id', content.news.remove);

module.exports = router;
