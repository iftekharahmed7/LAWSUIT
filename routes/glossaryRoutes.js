const express = require('express');
const router = express.Router();
const { addTerm, getAllTerms, searchTerms } = require('../controllers/glossaryController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.post('/', protect, requireRole('admin'), addTerm);
router.get('/', getAllTerms);
router.get('/search', searchTerms);

module.exports = router;
