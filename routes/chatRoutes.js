const express = require('express');
const router = express.Router();
const { askQuestion } = require('../controllers/chatController');
const { attachUserIfPresent } = require('../middleware/authMiddleware');

router.post('/', attachUserIfPresent, askQuestion);

module.exports = router;
