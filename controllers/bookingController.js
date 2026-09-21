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

const VALID_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
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

    // Owners may only cancel their own booking. Confirming/completing a
    // booking is a lawyer/admin decision, not something the requester can
    // grant themselves.
    if (isOwner && !isAdmin && status !== 'cancelled') {
      return res.status(403).json({ message: 'Only an admin can set this status' });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({ message: 'Booking updated', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createBooking, getMyBookings, updateBookingStatus };
