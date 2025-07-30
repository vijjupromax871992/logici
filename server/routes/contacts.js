// routes/contacts.js
const express = require('express');
const router = express.Router();
const contactsController = require('../controllers/contactsController');
const { verifyAccessToken } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

// Public route for creating contacts (no authentication required)
router.post('/api/public/contactOnly', contactsController.createContact);

// Admin routes for managing contacts
router.get('/api/admin/contacts', 
  verifyAccessToken, 
  isAdmin, 
  contactsController.getAllContacts
);

router.get('/api/admin/contacts/:contactId',
  verifyAccessToken,
  isAdmin,
  contactsController.getContactById
);

router.put('/api/admin/contacts/:contactId/status',
  verifyAccessToken,
  isAdmin,
  contactsController.updateContactStatus
);

router.delete('/api/admin/contacts/:contactId',
  verifyAccessToken,
  isAdmin,
  contactsController.deleteContact
);

module.exports = router;