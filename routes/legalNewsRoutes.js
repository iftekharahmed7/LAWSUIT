const express = require('express');
const router = express.Router();
const { getAllNews, addNews } = require('../controllers/legalNewsController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.get('/', getAllNews);
router.post('/', protect, requireRole('admin'), addNews);

module.exports = router;
