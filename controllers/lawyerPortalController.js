const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Lawyer = require('../models/Lawyer');

// Which status a lawyer may move a booking to, from its current status.
const TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
};
const STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];

const serverError = (res, where, error) => {
  console.error(`[lawyer-portal:${where}]`, error);
  return res.status(500).json({ message: 'Server error' });
};

const noProfile = (res) =>
  res.status(404).json({
    message: 'No lawyer profile is linked to this account yet. Ask an admin to link it.',
  });

const findMyProfile = (req) => Lawyer.findOne({ user: req.user.id });

// GET /api/lawyer-portal/me
const getMyProfile = async (req, res) => {
  try {
    const profile = await findMyProfile(req);
    if (!profile) return noProfile(res);
    res.status(200).json(profile);
  } catch (error) {
    return serverError(res, 'me', error);
  }
};

// GET /api/lawyer-portal/bookings?status=pending - soonest first
const getMyBookings = async (req, res) => {
  try {
    const profile = await findMyProfile(req);
    if (!profile) return noProfile(res);

    const filter = { lawyer: profile._id };
    const { status } = req.query;
    if (typeof status === 'string' && status) {
      if (!STATUSES.includes(status)) {
        return res.status(400).json({ message: 'Invalid status filter' });
      }
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .sort({ date: 1, createdAt: 1 })
      .limit(500);

    res.status(200).json(bookings);
  } catch (error) {
    return serverError(res, 'bookings', error);
  }
};

// PATCH /api/lawyer-portal/bookings/:id/status  body: { status }
const updateMyBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (typeof status !== 'string' || !['confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Status must be confirmed, completed or cancelled.' });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const profile = await findMyProfile(req);
    if (!profile) return noProfile(res);

    // Scoped to this lawyer: another lawyer's booking looks exactly like a missing one.
    const booking = await Booking.findOne({ _id: req.params.id, lawyer: profile._id });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const allowed = TRANSITIONS[booking.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `A ${booking.status} booking can't be marked ${status}.` });
    }

    booking.status = status;
    await booking.save();
    await booking.populate('user', 'name email');

    res.status(200).json({ message: 'Booking updated', booking });
  } catch (error) {
    return serverError(res, 'status', error);
  }
};

module.exports = { getMyProfile, getMyBookings, updateMyBookingStatus };
