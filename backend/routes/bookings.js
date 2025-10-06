const express = require('express');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   POST /bookings
// @desc    Create new booking
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { eventId, ticketsBooked } = req.body;

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is upcoming
    if (event.status !== 'upcoming') {
      return res.status(400).json({ message: 'Event is not available for booking' });
    }

    // Check if enough tickets are available
    if (event.availableTickets < ticketsBooked) {
      return res.status(400).json({ message: 'Not enough tickets available' });
    }

    // Calculate total amount
    const totalAmount = event.price * ticketsBooked;

    // Create booking
    const booking = new Booking({
      user: req.user._id,
      event: eventId,
      ticketsBooked,
      totalAmount
    });

    await booking.save();

    // Update event available tickets
    event.availableTickets -= ticketsBooked;
    await event.save();

    // Create notification for user
    const notification = new Notification({
      user: req.user._id,
      message: `Your booking for "${event.title}" has been confirmed!`,
      type: 'booking'
    });
    await notification.save();

    // Populate booking with event and user details
    await booking.populate([
      { path: 'event', select: 'title date time location price' },
      { path: 'user', select: 'name email' }
    ]);

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /bookings
// @desc    Get user's bookings
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // Users can only see their own bookings
    if (req.user.role === 'user') {
      query.user = req.user._id;
    }
    // Organizers can see bookings for their events
    else if (req.user.role === 'organizer') {
      const userEvents = await Event.find({ organizer: req.user._id }).select('_id');
      query.event = { $in: userEvents.map(e => e._id) };
    }
    // Admins can see all bookings

    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .populate('event', 'title date time location price')
      .sort({ bookingDate: -1 });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('event', 'title date time location price organizer');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check permissions
    const canView = 
      booking.user._id.toString() === req.user._id.toString() ||
      (req.user.role === 'organizer' && 
       booking.event.organizer.toString() === req.user._id.toString()) ||
      req.user.role === 'admin';

    if (!canView) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /bookings/:id/cancel
// @desc    Cancel booking
// @access  Private
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event', 'title availableTickets');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check permissions
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if booking is already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    // Return tickets to event
    const event = await Event.findById(booking.event._id);
    event.availableTickets += booking.ticketsBooked;
    await event.save();

    // Create notification
    const notification = new Notification({
      user: booking.user,
      message: `Your booking for "${booking.event.title}" has been cancelled.`,
      type: 'booking'
    });
    await notification.save();

    await booking.populate([
      { path: 'user', select: 'name email' },
      { path: 'event', select: 'title date time location price' }
    ]);

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
