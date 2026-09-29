const express = require('express');
const router = express.Router();
const { summarizeDocument } = require('../controllers/summarizeController');
const { attachUserIfPresent } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimit');

router.post('/', attachUserIfPresent, aiLimiter, summarizeDocument);

module.exports = router;
