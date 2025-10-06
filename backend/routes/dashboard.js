const express = require('express');
const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   GET /dashboard/summary
// @desc    Get admin dashboard summary
// @access  Private (Admin only)
router.get('/summary', auth, requireRole(['admin']), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Recent bookings for chart
    const recentBookings = await Booking.aggregate([
      {
        $match: { status: 'confirmed' }
      },
      {
        $group: {
          _id: {
            year: { $year: '$bookingDate' },
            month: { $month: '$bookingDate' },
            day: { $dayOfMonth: '$bookingDate' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      },
      {
        $limit: 30
      }
    ]);

    // Popular events
    const popularEvents = await Booking.aggregate([
      {
        $match: { status: 'confirmed' }
      },
      {
        $group: {
          _id: '$event',
          totalBookings: { $sum: 1 },
          totalTickets: { $sum: '$ticketsBooked' },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: '_id',
          as: 'event'
        }
      },
      {
        $unwind: '$event'
      },
      {
        $project: {
          title: '$event.title',
          totalBookings: 1,
          totalTickets: 1,
          totalRevenue: 1
        }
      },
      {
        $sort: { totalBookings: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // User role distribution
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Event category distribution
    const eventStats = await Event.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      summary: {
        totalUsers,
        totalEvents,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      charts: {
        recentBookings,
        popularEvents,
        userStats,
        eventStats
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /dashboard/organizer
// @desc    Get organizer dashboard summary
// @access  Private (Organizer only)
router.get('/organizer', auth, requireRole(['organizer']), async (req, res) => {
  try {
    const organizerId = req.user._id;

    // Get organizer's events
    const totalEvents = await Event.countDocuments({ organizer: organizerId });
    const upcomingEvents = await Event.countDocuments({ 
      organizer: organizerId, 
      status: 'upcoming' 
    });

    // Get bookings for organizer's events
    const eventIds = await Event.find({ organizer: organizerId }).select('_id');
    const totalBookings = await Booking.countDocuments({
      event: { $in: eventIds },
      status: 'confirmed'
    });

    const totalRevenue = await Booking.aggregate([
      {
        $match: {
          event: { $in: eventIds },
          status: 'confirmed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Recent bookings for organizer's events
    const recentBookings = await Booking.find({
      event: { $in: eventIds },
      status: 'confirmed'
    })
      .populate('user', 'name email')
      .populate('event', 'title date')
      .sort({ bookingDate: -1 })
      .limit(10);

    // Events with booking counts
    const eventsWithBookings = await Event.aggregate([
      {
        $match: { organizer: organizerId }
      },
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'event',
          as: 'bookings'
        }
      },
      {
        $project: {
          title: 1,
          date: 1,
          status: 1,
          availableTickets: 1,
          totalBookings: { $size: '$bookings' },
          totalTicketsSold: {
            $sum: {
              $map: {
                input: '$bookings',
                as: 'booking',
                in: { $cond: [{ $eq: ['$$booking.status', 'confirmed'] }, '$$booking.ticketsBooked', 0] }
              }
            }
          }
        }
      },
      {
        $sort: { date: 1 }
      }
    ]);

    res.json({
      summary: {
        totalEvents,
        upcomingEvents,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentBookings,
      eventsWithBookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /dashboard/user
// @desc    Get user dashboard summary
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's bookings
    const totalBookings = await Booking.countDocuments({ user: userId });
    const upcomingBookings = await Booking.countDocuments({
      user: userId,
      status: 'confirmed'
    });

    const totalSpent = await Booking.aggregate([
      {
        $match: {
          user: userId,
          status: 'confirmed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Recent bookings
    const recentBookings = await Booking.find({ user: userId })
      .populate('event', 'title date time location')
      .sort({ bookingDate: -1 })
      .limit(5);

    // Unread notifications count
    const unreadNotifications = await Notification.countDocuments({
      user: userId,
      read: false
    });

    res.json({
      summary: {
        totalBookings,
        upcomingBookings,
        totalSpent: totalSpent[0]?.total || 0,
        unreadNotifications
      },
      recentBookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
