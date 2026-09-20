const Booking = require('../models/Booking');

const createBooking = async (req, res) => {
  try {
    const { lawyer, date, timeSlot, notes } = req.body;
    const user = req.user.id;

    if (!lawyer || !date || !timeSlot) {
      return res.status(400).json({ message: 'lawyer, date, and timeSlot are required' });
    }

    const newBooking = new Booking({ user, lawyer, date, timeSlot, notes });
    await newBooking.save();

    res.status(201).json({ message: 'Booking created', booking: newBooking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('lawyer', 'name specialization contact')
      .sort({ date: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Only an admin can move a booking to 'confirmed' or 'completed' - those
// statuses represent the lawyer/admin side actually confirming or having
// held the appointment. The booking owner can only cancel their own
// booking; letting an owner self-confirm would make the status meaningless.
const OWNER_ALLOWED_STATUSES = ['cancelled'];
const ALL_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!ALL_STATUSES.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${ALL_STATUSES.join(', ')}` });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const isOwner = booking.user.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }
    if (isOwner && !isAdmin && !OWNER_ALLOWED_STATUSES.includes(status)) {
      return res.status(403).json({ message: 'You can only cancel your own booking - confirmation is handled by the lawyer/admin.' });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({ message: 'Booking updated', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createBooking, getMyBookings, updateBookingStatus };
