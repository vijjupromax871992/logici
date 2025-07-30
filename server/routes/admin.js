// routes/admin.js - ENHANCED WITH CONFIRMED BOOKINGS SUPPORT
const express = require('express');
const { isAdmin } = require('../middleware/adminMiddleware');
const { verifyAccessToken } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');
const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(verifyAccessToken, isAdmin);

// Dashboard
router.get('/analytics/dashboard', adminController.getDashboardAnalytics);

// Warehouse Management
router.get('/warehouses/pending', adminController.getPendingWarehouses);
router.post('/warehouses/approve/:id', adminController.approveWarehouse);
router.post('/warehouses/reject/:id', adminController.rejectWarehouse);

// Analytics
router.get('/analytics/users', adminController.getUserAnalytics);
router.get('/analytics/warehouses', adminController.getWarehouseAnalytics);

// Activity Logs
router.get('/users/activity-logs', adminController.getActivityLogs);

// Admin User Management
router.post('/create-admin', adminController.createAdmin);
router.get('/admin-users/stats', adminController.getAdminStats); 
router.get('/admin-users', adminController.getAdminUsers);
router.get('/admin-users/:id', adminController.getAdminUserById);
router.put('/admin-users/:id', adminController.updateAdminUser);
router.delete('/admin-users/:id', adminController.deleteAdminUser);

// Enhanced Booking Management with confirmed bookings support
router.get('/bookings', adminController.getAllBookings);
router.get('/bookings/:id', adminController.getBookingById);
router.put('/bookings/:id/status', adminController.updateBookingStatus);
router.delete('/bookings/:id', adminController.deleteBooking);
router.put('/bookings/bulk-update', adminController.bulkUpdateBookingStatus);

module.exports = router;