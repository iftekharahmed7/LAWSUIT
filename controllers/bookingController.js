const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Lawyer = require('../models/Lawyer');

const VALID_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];
const ACTIVE = ['pending', 'confirmed'];
const TIME_SLOT_MAX = 30;
const NOTES_MAX = 1000;
const MAX_ACTIVE_BOOKINGS = 20;
const MAX_DAYS_AHEAD = 365;

const serverError = (res, where, error) => {
  console.error(`[bookings:${where}]`, error);
  return res.status(500).json({ message: 'Server error' });
};

// Accepts YYYY-MM-DD only; returns a UTC-midnight Date or null. Rejects
// impossible dates like 2026-02-31.
function parseDay(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value) return null;
  return d;
}

const createBooking = async (req, res) => {
  try {
    const { lawyer, date, timeSlot, notes } = req.body;
    const user = req.user.id;

    if (typeof lawyer !== 'string' || !mongoose.isValidObjectId(lawyer)) {
      return res.status(400).json({ message: 'A valid lawyer is required.' });
    }

    const day = parseDay(date);
    if (!day) {
      return res.status(400).json({ message: 'Please choose a valid date.' });
    }
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000); // slack for timezones
    const latest = new Date(today.getTime() + MAX_DAYS_AHEAD * 24 * 60 * 60 * 1000);
    if (day < yesterday) {
      return res.status(400).json({ message: 'Please choose a date that is not in the past.' });
    }
    if (day > latest) {
      return res.status(400).json({ message: 'Please choose a date within the next year.' });
    }

    const slot = typeof timeSlot === 'string' ? timeSlot.trim() : '';
    if (!slot || slot.length > TIME_SLOT_MAX) {
      return res.status(400).json({ message: 'Please enter a preferred time.' });
    }

    if (notes !== undefined && notes !== null && typeof notes !== 'string') {
      return res.status(400).json({ message: 'Notes must be text.' });
    }
    const cleanNotes = typeof notes === 'string' ? notes.trim() : '';
    if (cleanNotes.length > NOTES_MAX) {
      return res.status(400).json({ message: `Notes must be under ${NOTES_MAX} characters.` });
    }

    if (!(await Lawyer.exists({ _id: lawyer }))) {
      return res.status(404).json({ message: 'Lawyer not found.' });
    }

    const duplicate = await Booking.exists({
      user, lawyer, date: day, timeSlot: slot, status: { $in: ACTIVE },
    });
    if (duplicate) {
      return res.status(409).json({ message: 'You already have a booking with this lawyer for that date and time.' });
    }

    const activeCount = await Booking.countDocuments({ user, status: { $in: ACTIVE } });
    if (activeCount >= MAX_ACTIVE_BOOKINGS) {
      return res.status(429).json({ message: 'You have too many active bookings. Cancel one before booking another.' });
    }

    const newBooking = new Booking({ user, lawyer, date: day, timeSlot: slot, notes: cleanNotes || undefined });
    await newBooking.save();

    res.status(201).json({ message: 'Booking created', booking: newBooking });
  } catch (error) {
    return serverError(res, 'create', error);
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('lawyer', 'name specialization contact')
      .sort({ date: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    return serverError(res, 'mine', error);
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (typeof status !== 'string' || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const isOwner = String(booking.user) === String(req.user.id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // Owners may only cancel their own booking, and only while it is still
    // pending or confirmed. Confirming/completing is an admin decision.
    if (isOwner && !isAdmin) {
      if (status !== 'cancelled') {
        return res.status(403).json({ message: 'Only an admin can set this status' });
      }
      if (!ACTIVE.includes(booking.status)) {
        return res.status(400).json({ message: 'This booking can no longer be cancelled.' });
      }
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({ message: 'Booking updated', booking });
  } catch (error) {
    return serverError(res, 'status', error);
  }
};

module.exports = { createBooking, getMyBookings, updateBookingStatus };
