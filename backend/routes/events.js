const express = require('express');
const Event = require('../models/Event');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   GET /events/public
// @desc    Get all upcoming events (public)
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    
    let query = { status: 'upcoming' };
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ date: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(query);

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /events/:id
// @desc    Get single event
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /events
// @desc    Get organizer's events
// @access  Private (Organizer/Admin)
router.get('/', auth, requireRole(['organizer', 'admin']), async (req, res) => {
  try {
    let query = {};
    
    // Organizers can only see their own events, admins can see all
    if (req.user.role === 'organizer') {
      query.organizer = req.user._id;
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /events
// @desc    Create new event
// @access  Private (Organizer/Admin)
router.post('/', auth, requireRole(['organizer', 'admin']), async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      time,
      location,
      category,
      image,
      price,
      availableTickets
    } = req.body;

    const event = new Event({
      title,
      description,
      date,
      time,
      location,
      category,
      image,
      price,
      availableTickets,
      organizer: req.user._id
    });

    await event.save();
    await event.populate('organizer', 'name email');

    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /events/:id
// @desc    Update event
// @access  Private (Organizer/Admin)
router.put('/:id', auth, requireRole(['organizer', 'admin']), async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    // Organizers can only update their own events
    if (req.user.role === 'organizer') {
      query.organizer = req.user._id;
    }

    const event = await Event.findOneAndUpdate(
      query,
      { $set: req.body },
      { new: true }
    ).populate('organizer', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /events/:id
// @desc    Delete event
// @access  Private (Organizer/Admin)
router.delete('/:id', auth, requireRole(['organizer', 'admin']), async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    // Organizers can only delete their own events
    if (req.user.role === 'organizer') {
      query.organizer = req.user._id;
    }

    const event = await Event.findOneAndDelete(query);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
