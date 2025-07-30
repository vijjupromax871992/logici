// /backend/routes/roles.js
const express = require('express');
const { getRoles, createRole } = require('../controllers/rolesController');
const router = express.Router();

router.get('/api/roles', getRoles);
router.post('/api/roles', createRole);

module.exports = router;
