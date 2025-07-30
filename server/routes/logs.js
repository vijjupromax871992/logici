const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Endpoint to receive frontend error logs
router.post('/api/logs/error', (req, res) => {
  const { message, stack, context, userAgent, timestamp, url } = req.body;
  
  // Log to backend logger
  logger.error(`Frontend Error: ${message}`, {
    stack,
    context,
    userAgent,
    timestamp,
    url,
    userId: req.session?.userId || 'anonymous'
  });
  
  res.status(200).json({ success: true });
});

// Endpoint to receive critical logs
router.post('/api/logs/critical', (req, res) => {
  const { message, data, timestamp, url } = req.body;
  
  logger.error(`Frontend Critical: ${message}`, {
    data,
    timestamp,
    url,
    userId: req.session?.userId || 'anonymous'
  });
  
  res.status(200).json({ success: true });
});

module.exports = router;