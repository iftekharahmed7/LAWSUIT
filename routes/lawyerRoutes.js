const express = require('express');
const router = express.Router();
const { addLawyer, getAllLawyers, searchLawyers, getLawyerById } = require('../controllers/lawyerController');

router.post('/', addLawyer);
router.get('/', getAllLawyers);
router.get('/search', searchLawyers);
router.get('/:id', getLawyerById);

module.exports = router;