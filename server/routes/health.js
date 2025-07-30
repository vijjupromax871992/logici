// /backend/routes/health.js
const express = require('express');
const router = express.Router();
const { checkHealth } = require('../controllers/healthController');

router.get('/api/health', checkHealth);

module.exports = router;
