const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/sendEmail');

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // role is never taken from the client - every account starts as a plain
    // 'user'. Promotion to 'admin'/'lawyer' happens out-of-band (see
    // scripts/makeAdmin.js), never via this public endpoint.
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: 'User created successfully', user: { name, email, role: newUser.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { signup, login };

/**
 * POST /api/auth/forgot-password  body: { email }
 * Always responds with the same generic message whether or not the email
 * exists - revealing that would let an attacker enumerate registered users.
 */
const forgotPassword = async (req, res) => {
  const genericResponse = { message: 'If an account exists for that email, a reset link has been sent.' };
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(200).json(genericResponse);

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // req.protocol/host reflect the real deployed URL automatically (Render
    // or your Codespace's forwarded port) - see server.js's `trust proxy`
    // setting, which is what makes req.protocol report "https" correctly
    // when running behind Render's reverse proxy.
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${rawToken}`;

    const sent = await sendEmail({
      to: user.email,
      subject: 'Reset your LawSuite password',
      html: `
        <p>Hi ${user.name},</p>
        <p>Click the link below to reset your LawSuite password. This link expires in 1 hour.</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });

    if (!sent) {
      console.warn(`[forgotPassword] Email not actually sent for ${user.email} - EMAIL_USER/EMAIL_PASS may not be configured.`);
    }

    res.status(200).json(genericResponse);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * POST /api/auth/reset-password  body: { token, newPassword }
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports.forgotPassword = forgotPassword;
module.exports.resetPassword = resetPassword;
