// routes/warehouses.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const { verifyAccessToken } = require('../middleware/authMiddleware');
const {
    getCityStateSuggestions,
    getWarehouses,
    createWarehouse,
    getWarehouseById,
    updateWarehouse,
    deleteWarehouse,
    getWarehouseAnalytics,
    getWarehouseStats,
    trackWarehouseView
} = require('../controllers/warehousesController');

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// Public routes
router.get('/api/cities', getCityStateSuggestions);

// Analytics and Stats (place before :id routes to avoid conflicts)
router.get('/api/warehouses/analytics', verifyAccessToken, getWarehouseAnalytics);
router.get('/api/warehouses/stats', verifyAccessToken, getWarehouseStats);

// Protected CRUD routes
router.get('/api/warehouses', verifyAccessToken, getWarehouses);
router.get('/api/warehouses/filter', verifyAccessToken, getWarehouses);
router.post('/api/warehouses', verifyAccessToken, upload.array('images', 10), createWarehouse);
router.get('/api/warehouses/:id', verifyAccessToken, getWarehouseById);
router.put('/api/warehouses/:id', verifyAccessToken, upload.array('images', 5), updateWarehouse);
router.delete('/api/warehouses/:id', verifyAccessToken, deleteWarehouse);
router.post('/api/warehouses/:id/view', verifyAccessToken, trackWarehouseView);

module.exports = router;