// publicWarehouseRoutes.js
const express = require('express');
const { 
    getPublicWarehouses,
    getPublicWarehouseById,
    trackWarehouseView,
    searchWarehouses
} = require('../controllers/publicWarehouseController');

const router = express.Router();

// Public routes for client access - no authentication needed
router.get('/api/public/warehouses/search', searchWarehouses);
router.get('/api/public/warehouses', getPublicWarehouses);
router.get('/api/public/warehouses/filter', getPublicWarehouses);
router.get('/api/public/warehouses/:id', getPublicWarehouseById);
router.post('/api/public/warehouses/:id/view', trackWarehouseView);

module.exports = router;