// server/routes/analytics.js
const express = require('express');
const { verifyAccessToken } = require('../middleware/authMiddleware');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyAccessToken);

// Analytics routes
router.get('/warehouses/analytics', analyticsController.getWarehouseAnalytics);
router.get('/analytics/warehouse/:warehouseId', analyticsController.getWarehouseStats);

module.exports = router;