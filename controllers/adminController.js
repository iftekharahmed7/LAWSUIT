const mongoose = require('mongoose');
const User = require('../models/User');
const Lawyer = require('../models/Lawyer');
const Booking = require('../models/Booking');
const Document = require('../models/Document');
const GlossaryTerm = require('../models/GlossaryTerm');
const LegalNews = require('../models/LegalNews');

const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];
const ASSIGNABLE_ROLES = ['user', 'admin'];
const LIST_LIMIT = 500;

const serverError = (res, where, error) => {
  console.error(`[admin:${where}]`, error);
  return res.status(500).json({ message: 'Server error' });
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/admin/stats - headline numbers for the dashboard
const getStats = async (req, res) => {
  try {
    const [users, lawyers, documents, glossaryTerms, newsItems, bookingGroups] = await Promise.all([
      User.countDocuments(),
      Lawyer.countDocuments(),
      Document.countDocuments(),
      GlossaryTerm.countDocuments(),
      LegalNews.countDocuments(),
      Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    const bookings = { total: 0, pending: 0, confirmed: 0, cancelled: 0, completed: 0 };
    for (const group of bookingGroups) {
      if (group._id in bookings) bookings[group._id] = group.count;
      bookings.total += group.count;
    }

    res.status(200).json({ users, lawyers, documents, glossaryTerms, newsItems, bookings });
  } catch (error) {
    return serverError(res, 'stats', error);
  }
};

// GET /api/admin/bookings?status=pending - every booking, newest date first
const getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (typeof status === 'string' && status) {
      if (!BOOKING_STATUSES.includes(status)) {
        return res.status(400).json({ message: 'Invalid status filter' });
      }
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .populate('lawyer', 'name specialization location')
      .sort({ date: -1, createdAt: -1 })
      .limit(LIST_LIMIT);

    res.status(200).json(bookings);
  } catch (error) {
    return serverError(res, 'bookings', error);
  }
};

// GET /api/admin/users?q=text - accounts, newest first (never returns passwords)
const getUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const filter = {};
    if (typeof q === 'string' && q.trim()) {
      const pattern = { $regex: escapeRegex(q.trim().slice(0, 100)), $options: 'i' };
      filter.$or = [{ name: pattern }, { email: pattern }];
    }

    const users = await User.find(filter)
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(LIST_LIMIT);

    res.status(200).json(users);
  } catch (error) {
    return serverError(res, 'users', error);
  }
};

// PATCH /api/admin/users/:id/role  body: { role: 'user' | 'admin' }
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (typeof role !== 'string' || !ASSIGNABLE_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Role must be "user" or "admin".' });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Stops an admin locking themselves out, which also guarantees there is
    // always at least one admin left.
    if (String(req.params.id) === String(req.user.id)) {
      return res.status(400).json({ message: 'You cannot change your own role.' });
    }

    const user = await User.findById(req.params.id).select('name email role createdAt');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'lawyer') {
      return res.status(400).json({
        message: 'This account is linked to a lawyer profile. Unlink it from the Lawyers tab first.',
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ message: 'Role updated', user });
  } catch (error) {
    return serverError(res, 'role', error);
  }
};

// GET /api/admin/lawyers - every lawyer profile, with its linked account
const getLawyers = async (req, res) => {
  try {
    const lawyers = await Lawyer.find()
      .populate('user', 'name email')
      .sort({ name: 1 })
      .limit(LIST_LIMIT);
    res.status(200).json(lawyers);
  } catch (error) {
    return serverError(res, 'lawyers', error);
  }
};

// Puts an account back to a normal user when it stops being a lawyer.
async function releaseAccount(userId) {
  if (!userId) return;
  const previous = await User.findById(userId);
  if (previous && previous.role === 'lawyer') {
    previous.role = 'user';
    await previous.save();
  }
}

// PATCH /api/admin/lawyers/:id/link
//   body: { email: "lawyer@example.com" }  -> link that account to this profile
//   body: { email: null }                  -> unlink
const linkLawyerAccount = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Lawyer not found' });
    }
    const lawyer = await Lawyer.findById(req.params.id);
    if (!lawyer) {
      return res.status(404).json({ message: 'Lawyer not found' });
    }

    const { email } = req.body;

    // Unlink
    if (email === null || email === '') {
      const previousUser = lawyer.user;
      lawyer.user = undefined;
      await lawyer.save();
      await releaseAccount(previousUser);
      return res.status(200).json({ message: 'Account unlinked', lawyer });
    }

    if (typeof email !== 'string') {
      return res.status(400).json({ message: 'Please enter an email address.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No account uses that email. Ask the lawyer to sign up first.' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ message: "Admin accounts can't be linked to a lawyer profile." });
    }

    const elsewhere = await Lawyer.findOne({ user: user._id, _id: { $ne: lawyer._id } });
    if (elsewhere) {
      return res.status(409).json({ message: `That account is already linked to ${elsewhere.name}.` });
    }

    const previousUser = lawyer.user;
    lawyer.user = user._id;
    await lawyer.save();

    user.role = 'lawyer';
    await user.save();

    if (previousUser && String(previousUser) !== String(user._id)) {
      await releaseAccount(previousUser);
    }

    await lawyer.populate('user', 'name email');
    res.status(200).json({ message: 'Account linked', lawyer });
  } catch (error) {
    return serverError(res, 'link', error);
  }
};

module.exports = {
  getStats,
  getAllBookings,
  getUsers,
  updateUserRole,
  getLawyers,
  linkLawyerAccount,
  releaseAccount,
};
