const express = require('express');
const router = express.Router();
const { askQuestion } = require('../controllers/chatController');
const { attachUserIfPresent } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimit');

router.post('/', attachUserIfPresent, aiLimiter, askQuestion);

module.exports = router;
