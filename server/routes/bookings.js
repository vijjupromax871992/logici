// routes/bookings.js - ENHANCED WITH CONFIRMED BOOKINGS SUPPORT
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyAccessToken } = require('../middleware/authMiddleware');

// Public routes
router.post('/api/public/bookings', bookingController.createBooking);

// Protected routes for owners 
router.get('/api/bookings', verifyAccessToken, bookingController.getOwnerBookings);
router.put('/api/bookings/:id/status', verifyAccessToken, bookingController.updateBookingStatus);
router.get('/api/bookings/stats', verifyAccessToken, bookingController.getBookingStats);

module.exports = router;