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

    user.role = role;
    await user.save();

    res.status(200).json({ message: 'Role updated', user });
  } catch (error) {
    return serverError(res, 'role', error);
  }
};

module.exports = { getStats, getAllBookings, getUsers, updateUserRole };
