const { InquiryType } = require('../models');
const logger = require('../utils/logger');


// GET /api/inquiry-types
exports.getInquiryTypes = async (req, res) => {
  try {
    const inquiryTypes = await InquiryType.findAll();
    res.status(200).json({ success: true, data: inquiryTypes });
  } catch (error) {
    logger.error(`Error in getInquiryTypes: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to fetch inquiry types' });
  }
};

// POST /api/inquiry-types
exports.createInquiryType = async (req, res) => {
  try {
    const { name, description } = req.body;
    const newInquiryType = await InquiryType.create({ name, description });
    res.status(201).json({ success: true, data: newInquiryType });
  } catch (error) {
    logger.error(`Error in createInquiryType: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to create inquiry type' });
  }
};
