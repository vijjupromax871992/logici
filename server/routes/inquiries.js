// routes/inquiries.js
const express = require('express');
const router = express.Router();
const inquiriesController = require('../controllers/inquiriesController');
const { verifyAccessToken } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

// Public route for creating inquiries (no authentication required)
router.post('/api/public/inquiries', inquiriesController.createInquiry);

// Partner routes (requires authentication)
router.get('/api/partner/inquiries', 
    verifyAccessToken, 
    inquiriesController.getPartnerInquiries
  );
  
  router.get('/api/partner/inquiries/unallocated', 
    verifyAccessToken, 
    inquiriesController.getUnallocatedInquiries
  );
  
  router.put('/api/partner/inquiries/:inquiryId/status',
    verifyAccessToken,
    inquiriesController.updateInquiryStatus
  );
  

// Admin routes
router.get('/api/admin/inquiries', 
  verifyAccessToken, 
  isAdmin, 
  inquiriesController.getAllInquiries
);

router.post('/api/admin/inquiries/:inquiryId/allocate',
  verifyAccessToken,
  isAdmin,
  inquiriesController.allocateInquiry
);

router.post('/api/admin/inquiries/:inquiryId/invalid',
  verifyAccessToken,
  isAdmin,
  inquiriesController.markInquiryInvalid
);

router.get('/api/admin/inquiries/:inquiryId',
  verifyAccessToken,
  isAdmin,
  inquiriesController.getInquiryById
);

router.post('/api/admin/inquiries/:inquiryId/reactivate',
  verifyAccessToken,
  isAdmin,
  inquiriesController.reactivateInquiry
);

router.delete('/api/admin/inquiries/:inquiryId',
  verifyAccessToken,
  isAdmin,
  inquiriesController.deleteInquiry
);

// Business partner routes
router.get('/api/partner/inquiries',
  verifyAccessToken,
  inquiriesController.getPartnerInquiries
);

module.exports = router;