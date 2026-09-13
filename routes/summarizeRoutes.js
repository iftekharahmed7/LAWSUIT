const express = require('express');
const router = express.Router();
const { summarizeDocument } = require('../controllers/summarizeController');
const { attachUserIfPresent } = require('../middleware/authMiddleware');

router.post('/', attachUserIfPresent, summarizeDocument);

module.exports = router;
