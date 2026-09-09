const express = require('express');
const router = express.Router();
const { addTerm, getAllTerms, searchTerms } = require('../controllers/glossaryController');

router.post('/', addTerm);
router.get('/', getAllTerms);
router.get('/search', searchTerms);

module.exports = router;