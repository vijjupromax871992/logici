const express = require('express');
const { getInquiryTypes, createInquiryType } = require('../controllers/inquiryTypesController');

const router = express.Router();

router.get('/api/inquiry-types', getInquiryTypes);
router.post('/api/inquiry-types', createInquiryType);

module.exports = router;
