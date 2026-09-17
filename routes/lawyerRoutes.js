const express = require('express');
const router = express.Router();
const { addLawyer, getAllLawyers, searchLawyers, getLawyerById } = require('../controllers/lawyerController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.post('/', protect, requireRole('admin'), addLawyer);
router.get('/', getAllLawyers);
router.get('/search', searchLawyers);
router.get('/:id', getLawyerById);

module.exports = router;
