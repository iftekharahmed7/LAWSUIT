const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/sendEmail');

const NAME_MAX = 100;
const EMAIL_MAX = 254;
const PASSWORD_MIN = 6;
const PASSWORD_MAX_BYTES = 72; // bcrypt ignores anything past 72 bytes
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Only plain strings are accepted from the request body. This is what stops
// NoSQL operator injection like {"email": {"$ne": null}}.
const cleanEmail = (v) => (typeof v === 'string' ? v.trim().toLowerCase() : null);

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const serverError = (res, where, error) => {
  console.error(`[auth:${where}]`, error);
  return res.status(500).json({ message: 'Server error' });
};

const passwordProblem = (password) => {
  if (typeof password !== 'string' || password.length < PASSWORD_MIN) {
    return `Password must be at least ${PASSWORD_MIN} characters.`;
  }
  if (Buffer.byteLength(password) > PASSWORD_MAX_BYTES) {
    return 'Password is too long (maximum 72 bytes).';
  }
  return null;
};

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const cleanName = typeof name === 'string' ? name.trim() : '';
    const emailNorm = cleanEmail(email);

    if (!cleanName || cleanName.length > NAME_MAX) {
      return res.status(400).json({ message: 'Please enter your name.' });
    }
    if (!emailNorm || emailNorm.length > EMAIL_MAX || !EMAIL_RE.test(emailNorm)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    const pwProblem = passwordProblem(password);
    if (pwProblem) return res.status(400).json({ message: pwProblem });

    const existingUser = await User.findOne({ email: emailNorm });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // role is never taken from the client - every account starts as a plain
    // 'user'. Promotion to 'admin'/'lawyer' happens out-of-band (see
    // scripts/makeAdmin.js), never via this public endpoint.
    const newUser = new User({ name: cleanName, email: emailNorm, password: hashedPassword });
    await newUser.save();

    res.status(201).json({
      message: 'User created successfully',
      user: { name: cleanName, email: emailNorm, role: newUser.role },
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    return serverError(res, 'signup', error);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailNorm = cleanEmail(email);

    if (!emailNorm || typeof password !== 'string') {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = await User.findOne({ email: emailNorm });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return serverError(res, 'login', error);
  }
};

/**
 * POST /api/auth/forgot-password  body: { email }
 * Always responds with the same generic message whether or not the email
 * exists - revealing that would let an attacker enumerate registered users.
 */
const forgotPassword = async (req, res) => {
  const genericResponse = { message: 'If an account exists for that email, a reset link has been sent.' };
  try {
    const emailNorm = cleanEmail(req.body.email);
    if (!emailNorm) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: emailNorm });
    if (!user) return res.status(200).json(genericResponse);

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Never build this from the Host header - an attacker can forge it and get
    // victims emailed a reset link pointing at their own site.
    if (!process.env.APP_URL) console.warn('[forgotPassword] APP_URL is not set - falling back to the request Host header (unsafe in production).');
    const baseUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

    const sent = await sendEmail({
      to: user.email,
      subject: 'Reset your LawSuite password',
      html: `
        <p>Hi ${escapeHtml(user.name)},</p>
        <p>Click the link below to reset your LawSuite password. This link expires in 1 hour.</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });

    if (!sent) {
      console.warn(`[forgotPassword] Email not actually sent for ${user.email} - RESEND_API_KEY may not be configured.`);
    }

    res.status(200).json(genericResponse);
  } catch (error) {
    return serverError(res, 'forgotPassword', error);
  }
};

/**
 * POST /api/auth/reset-password  body: { token, newPassword }
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (typeof token !== 'string' || !token || typeof newPassword !== 'string' || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    const pwProblem = passwordProblem(newPassword);
    if (pwProblem) return res.status(400).json({ message: pwProblem });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'This reset link is invalid or has expired. Please request a new one.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (error) {
    return serverError(res, 'resetPassword', error);
  }
};

module.exports = { signup, login, forgotPassword, resetPassword };
