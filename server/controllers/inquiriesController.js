// controllers/inquiriesController.js
const { Inquiry, User } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/inquiries';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).single('attachment');

exports.createInquiry = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ 
          success: false, 
          message: 'File upload error',
          error: err.message 
        });
      } else if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Server error during file upload',
          error: err.message 
        });
      }

      try {
        const formData = req.body;
        
        // Process checkbox arrays
        if (typeof formData.flexibilityRequirements === 'string') {
          formData.flexibilityRequirements = [formData.flexibilityRequirements];
        }
        if (typeof formData.fulfillmentServices === 'string') {
          formData.fulfillmentServices = [formData.fulfillmentServices];
        }

        // Add attachment URL if file was uploaded
        if (req.file) {
          formData.attachmentUrl = `/uploads/inquiries/${req.file.filename}`;
        }

        // Create inquiry
        const inquiry = await Inquiry.create({
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          companyName: formData.companyName,
          inquiryType: formData.inquiryType,
          message: formData.message,
          preferredContactMethod: formData.preferredContactMethod,
          preferredContactTime: formData.preferredContactTime,
          attachmentUrl: formData.attachmentUrl,
          consent: formData.consent,
          industryType: formData.industryType,
          industryOther: formData.industryOther,
          spaceType: formData.spaceType,
          locationPreference: formData.locationPreference,
          leaseDuration: formData.leaseDuration,
          preferredStartDate: formData.preferredStartDate,
          currentSystem: formData.currentSystem,
          wmsOther: formData.wmsOther,
          startDate: formData.startDate,
          endDate: formData.endDate,
          flexibilityRequirements: formData.flexibilityRequirements,
          fulfillmentServices: formData.fulfillmentServices,
        });

        res.status(201).json({
          success: true,
          message: 'Inquiry created successfully',
          data: inquiry
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Failed to create inquiry',
          error: error.message
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getAllInquiries = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) {
      whereClause.allocation_status = status;
    }

    let include = [];
    
    // Only include associations if not unallocated
    if (status === 'allocated') {
      include = [
        {
          model: User,
          as: 'allocatedBusinessPartner',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'allocatedByAdmin',
          attributes: ['id', 'firstName', 'lastName']
        }
      ];
    }

    const inquiries = await Inquiry.findAndCountAll({
      where: whereClause,
      include: include,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    // Format the response
    const formattedInquiries = inquiries.rows.map(inquiry => {
      const formattedInquiry = {
        id: inquiry.id,
        fullName: inquiry.fullName,
        email: inquiry.email,
        phoneNumber: inquiry.phoneNumber,
        companyName: inquiry.companyName,
        inquiryType: inquiry.inquiryType,
        message: inquiry.message,
        status: inquiry.status,
        allocation_status: inquiry.allocation_status,
        createdAt: inquiry.createdAt,
        updatedAt: inquiry.updatedAt
      };

      // Add allocated partner info if available
      if (inquiry.allocatedPartner) {
        formattedInquiry.allocatedPartner = {
          id: inquiry.allocatedPartner.id,
          name: `${inquiry.allocatedPartner.firstName} ${inquiry.allocatedPartner.lastName}`,
          email: inquiry.allocatedPartner.email
        };
      }

      // Add admin info if available
      if (inquiry.allocatedByAdmin) {
        formattedInquiry.allocatedBy = {
          id: inquiry.allocatedByAdmin.id,
          name: `${inquiry.allocatedByAdmin.firstName} ${inquiry.allocatedByAdmin.lastName}`
        };
      }

      return formattedInquiry;
    });

    res.status(200).json({
      success: true,
      data: formattedInquiries,
      total: inquiries.count,
      totalPages: Math.ceil(inquiries.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiries',
      error: error.message
    });
  }
};

// Get inquiries for business partner
exports.getPartnerInquiries = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const partnerId = req.userId; // From auth middleware

    const inquiries = await Inquiry.findAndCountAll({
      where: {
        allocated_to: partnerId
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: inquiries.rows,
      total: inquiries.count,
      totalPages: Math.ceil(inquiries.count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiries',
      error: error.message
    });
  }
};

// Allocate inquiry to business partner (admin only)
exports.allocateInquiry = async (req, res) => {
  try {
    const { inquiryId } = req.params;
    const { partnerId } = req.body;

    const inquiry = await Inquiry.findByPk(inquiryId);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    // Check if partner exists
    const partner = await User.findByPk(partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Business partner not found'
      });
    }

    await inquiry.update({
      allocation_status: 'allocated',
      allocated_to: partnerId,
      allocated_by: req.userId, // Admin's ID from auth middleware
      allocated_at: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Inquiry allocated successfully',
      data: inquiry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to allocate inquiry',
      error: error.message
    });
  }
};

// Mark inquiry as invalid (admin only)
exports.markInquiryInvalid = async (req, res) => {
  try {
    const { inquiryId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Invalidation reason is required'
      });
    }

    const inquiry = await Inquiry.findByPk(inquiryId);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    await inquiry.update({
      allocation_status: 'invalid',
      invalidation_reason: reason,
      allocated_by: req.userId // Admin's ID who marked it invalid
    });

    res.status(200).json({
      success: true,
      message: 'Inquiry marked as invalid',
      data: inquiry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark inquiry as invalid',
      error: error.message
    });
  }
};

// Get partner's allocated inquiries
exports.getPartnerInquiries = async (req, res) => {
  try {
    const partnerId = req.userId;

    const inquiries = await Inquiry.findAll({
      where: {
        allocated_to: partnerId,
        allocation_status: 'allocated'
      },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: inquiries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiries',
      error: error.message
    });
  }
};

// Get unallocated inquiries (viewable by all partners)
exports.getUnallocatedInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.findAll({
      where: {
        allocation_status: 'unallocated'
      },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: inquiries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unallocated inquiries',
      error: error.message
    });
  }
};

// Update inquiry status (for allocated inquiries)
exports.updateInquiryStatus = async (req, res) => {
  try {
    const { inquiryId } = req.params;
    const { status } = req.body;
    const partnerId = req.userId;

    // Validate status
    if (!['pending', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Find inquiry and verify ownership
    const inquiry = await Inquiry.findOne({
      where: {
        id: inquiryId,
        allocated_to: partnerId
      }
    });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found or not allocated to you'
      });
    }

    // Update status
    await inquiry.update({ status });

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: inquiry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
};

// Get inquiry by ID (admin only)
exports.getInquiryById = async (req, res) => {
  try {
    const { inquiryId } = req.params;

    const inquiry = await Inquiry.findByPk(inquiryId, {
      include: [
        {
          model: User,
          as: 'allocatedBusinessPartner',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'allocatedByAdmin',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    // Format the response
    const formattedInquiry = {
      id: inquiry.id,
      fullName: inquiry.fullName,
      email: inquiry.email,
      phoneNumber: inquiry.phoneNumber,
      companyName: inquiry.companyName,
      inquiryType: inquiry.inquiryType,
      message: inquiry.message,
      status: inquiry.status,
      allocation_status: inquiry.allocation_status,
      createdAt: inquiry.createdAt,
      updatedAt: inquiry.updatedAt,
      invalidation_reason: inquiry.invalidation_reason
    };

    // Add allocated partner info if available
    if (inquiry.allocatedBusinessPartner) {
      formattedInquiry.allocated_to = {
        id: inquiry.allocatedBusinessPartner.id,
        firstName: inquiry.allocatedBusinessPartner.firstName,
        lastName: inquiry.allocatedBusinessPartner.lastName,
        email: inquiry.allocatedBusinessPartner.email
      };
    }

    // Add admin info if available
    if (inquiry.allocatedByAdmin) {
      formattedInquiry.allocatedBy = {
        id: inquiry.allocatedByAdmin.id,
        name: `${inquiry.allocatedByAdmin.firstName} ${inquiry.allocatedByAdmin.lastName}`
      };
    }

    res.status(200).json({
      success: true,
      data: formattedInquiry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiry',
      error: error.message
    });
  }
};

// Reactivate inquiry (admin only)
exports.reactivateInquiry = async (req, res) => {
  try {
    const { inquiryId } = req.params;

    const inquiry = await Inquiry.findByPk(inquiryId);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    await inquiry.update({
      allocation_status: 'unallocated',
      allocated_to: null,
      allocated_by: null,
      allocated_at: null,
      invalidation_reason: null
    });

    res.status(200).json({
      success: true,
      message: 'Inquiry reactivated successfully',
      data: inquiry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate inquiry',
      error: error.message
    });
  }
};

// Delete inquiry (admin only)
exports.deleteInquiry = async (req, res) => {
  try {
    const { inquiryId } = req.params;

    const inquiry = await Inquiry.findByPk(inquiryId);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    // Delete associated file if exists
    if (inquiry.attachmentUrl) {
      const filePath = path.join(__dirname, '..', inquiry.attachmentUrl);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (fileError) {
          // Continue even if file deletion fails
        }
      }
    }

    await inquiry.destroy();

    res.status(200).json({
      success: true,
      message: 'Inquiry deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete inquiry',
      error: error.message
    });
  }
};
