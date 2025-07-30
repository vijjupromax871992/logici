// controllers/contactsController.js
const { Contact, User } = require('../models');

exports.createContact = async (req, res) => {
  try {
    const { fullName, email, phone, companyName, preferredContactMethod, preferredContactTime } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !companyName) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, phone, and company name are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate phone format (basic validation for 10-15 digits)
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number'
      });
    }

    // Check if contact with same email already exists (within last 24 hours to prevent spam)
    const existingContact = await Contact.findOne({
      where: {
        email: email,
        createdAt: {
          [require('sequelize').Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    if (existingContact) {
      return res.status(409).json({
        success: false,
        message: 'A contact request with this email was already submitted in the last 24 hours'
      });
    }

    // Create new contact
    const contact = await Contact.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      companyName: companyName.trim(),
      preferredContactMethod: preferredContactMethod || 'email',
      preferredContactTime: preferredContactTime ? preferredContactTime.trim() : null,
      status: 'new'
    });

    res.status(201).json({
      success: true,
      message: 'Contact request submitted successfully! We will get back to you soon.',
      data: {
        id: contact.id,
        fullName: contact.fullName,
        email: contact.email,
        companyName: contact.companyName,
        status: contact.status,
        createdAt: contact.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating contact:', error);

    // Handle specific Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit contact request. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all contacts (admin only)
exports.getAllContacts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const contacts = await Contact.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'contactedByUser',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: contacts.rows,
      total: contacts.count,
      totalPages: Math.ceil(contacts.count / limit),
      currentPage: parseInt(page)
    });

  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update contact status (admin only)
exports.updateContactStatus = async (req, res) => {
  try {
    const { contactId } = req.params;
    const { status, notes } = req.body;
    const adminId = req.userId; // From auth middleware

    const validStatuses = ['new', 'contacted', 'in_progress', 'completed', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ')
      });
    }

    const contact = await Contact.findByPk(contactId, {
      include: [
        {
          model: User,
          as: 'contactedByUser',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        }
      ]
    });
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    const updateData = { 
      status,
      notes: notes || contact.notes
    };

    // If marking as contacted for the first time, record who contacted and when
    if (status === 'contacted' && contact.status === 'new') {
      updateData.contactedBy = adminId;
      updateData.contactedAt = new Date();
    }

    await contact.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Contact status updated successfully',
      data: contact
    });

  } catch (error) {
    console.error('Error updating contact status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get contact by ID (admin only)
exports.getContactById = async (req, res) => {
  try {
    const { contactId } = req.params;

    const contact = await Contact.findByPk(contactId, {
      include: [
        {
          model: User,
          as: 'contactedByUser',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        }
      ]
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });

  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete contact (admin only)
exports.deleteContact = async (req, res) => {
  try {
    const { contactId } = req.params;

    const contact = await Contact.findByPk(contactId, {
      include: [
        {
          model: User,
          as: 'contactedByUser',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        }
      ]
    });
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    await contact.destroy();

    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};