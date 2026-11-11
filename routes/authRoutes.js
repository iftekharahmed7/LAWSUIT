const express = require('express');
const router = express.Router();
const { signup, login, forgotPassword, resetPassword, me } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { loginLimiter, signupLimiter, forgotLimiter, resetLimiter } = require('../middleware/rateLimit');

router.post('/signup', signupLimiter, signup);
router.post('/login', loginLimiter, login);
router.post('/forgot-password', forgotLimiter, forgotPassword);
router.post('/reset-password', resetLimiter, resetPassword);
router.get('/me', protect, me);

module.exports = router;
