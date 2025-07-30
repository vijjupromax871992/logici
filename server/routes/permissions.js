// /backend/routes/permissions.js
const express = require('express');
const { getPermissions, createPermission } = require('../controllers/permissionsController');
const router = express.Router();

router.get('/api/permissions', getPermissions);
router.post('/api/permissions', createPermission);

module.exports = router;
