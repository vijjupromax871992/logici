// routes/payments.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyAccessToken } = require('../middleware/authMiddleware');

// Public routes for payment (accessible by both registered and unregistered users)
router.post('/api/public/payments/create-order', paymentController.createBookingOrder);
router.post('/api/public/payments/verify', paymentController.verifyPayment);
router.post('/api/public/payments/failure', paymentController.handlePaymentFailure);
router.get('/api/public/payments/:payment_id/status', paymentController.getPaymentStatus);

// Protected routes for owners
router.get('/api/payments/bookings', verifyAccessToken, paymentController.getConfirmedBookings);

// Webhook route (no authentication required for Razorpay webhooks)
router.post('/api/payments/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

module.exports = router;