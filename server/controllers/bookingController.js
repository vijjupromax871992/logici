// controllers/bookingController.js - FIXED FOR MISSING CONFIRMED BOOKINGS TABLE
const { Booking, Warehouse, User, ConfirmedBooking, Payment } = require('../models');
const { sendConfirmationEmail } = require('../services/emailService');
const { Op } = require('sequelize');

// ===============================
// OWNER/USER BOOKING METHODS
// ===============================

exports.getOwnerBookings = async (req, res) => {
  try {
    const owner_id = req.user.id;
    const { 
      page = 1, 
      limit = 10, 
      status,
      warehouse_id,
      type = 'all'
    } = req.query;
    
    const offset = (page - 1) * limit;

    let allBookings = [];
    let totalCount = 0;

    // Always get booking inquiries
    const whereClause = { owner_id };
    
    if (status && (type === 'all' || type === 'inquiries')) {
      whereClause.status = status;
    }
    
    if (warehouse_id) {
      whereClause.warehouse_id = warehouse_id;
    }

    const bookings = await Booking.findAll({
      where: whereClause,
      include: [
        {
          model: Warehouse,
          as: 'warehouse',
          attributes: ['name', 'address', 'city', 'state'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Transform booking inquiries
    const transformedBookings = bookings.map(booking => ({
      ...booking.toJSON(),
      type: 'inquiry',
      booking_type: 'inquiry',
      amount_paid: 0,
      payment_status: 'pending',
      razorpay_payment_id: null,
      payment_method: null,
      payment_date: null,
      booking_number: null,
      is_paid: false
    }));

    allBookings = [...transformedBookings];
    totalCount = bookings.length;

    // Try to get confirmed bookings if the table exists
    if (type === 'all' || type === 'confirmed') {
      try {
        const confirmedWhereClause = { owner_id };
        
        if (status && type === 'confirmed') {
          confirmedWhereClause.status = status;
        }
        
        if (warehouse_id) {
          confirmedWhereClause.warehouse_id = warehouse_id;
        }

        const confirmedBookings = await ConfirmedBooking.findAll({
          where: confirmedWhereClause,
          include: [
            {
              model: Warehouse,
              as: 'warehouse',
              attributes: ['name', 'address', 'city', 'state'],
              required: false
            },
            {
              model: Payment,
              as: 'payment',
              attributes: ['razorpay_payment_id', 'payment_method', 'amount'],
              required: false
            }
          ],
          order: [['createdAt', 'DESC']]
        });

        // Transform confirmed bookings
        const transformedConfirmedBookings = confirmedBookings.map(booking => ({
          ...booking.toJSON(),
          type: 'confirmed',
          booking_type: 'confirmed',
          payment_status: 'paid',
          amount_paid: booking.amount_paid,
          razorpay_payment_id: booking.payment?.razorpay_payment_id,
          payment_method: booking.payment?.payment_method,
          payment_date: booking.payment_date,
          is_paid: true,
          // Map confirmed booking statuses to display statuses
          status: booking.status === 'confirmed' ? 'active' : booking.status
        }));

        allBookings = [...allBookings, ...transformedConfirmedBookings];
        totalCount += confirmedBookings.length;
      } catch (confirmedError) {
        // Continue without confirmed bookings
      }
    }

    // Sort all bookings by creation date
    allBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const paginatedBookings = allBookings.slice(offset, offset + parseInt(limit));

    res.status(200).json({
      success: true,
      data: paginatedBookings,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        pages: Math.ceil(totalCount / limit)
      },
      summary: {
        total_inquiries: allBookings.filter(b => b.type === 'inquiry').length,
        total_confirmed: allBookings.filter(b => b.type === 'confirmed').length,
        total_revenue: allBookings
          .filter(b => b.type === 'confirmed')
          .reduce((sum, b) => sum + (b.amount_paid || 0), 0)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, type = 'inquiry' } = req.body;
    const owner_id = req.user.id;

    if (type === 'inquiry') {
      const validStatuses = ['pending', 'contacted', 'resolved'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status for inquiry. Must be one of: pending, contacted, resolved'
        });
      }

      const booking = await Booking.findOne({
        where: { 
          id,
          owner_id
        }
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking inquiry not found or unauthorized'
        });
      }

      await booking.update({ status });

      res.status(200).json({
        success: true,
        message: 'Booking inquiry status updated successfully',
        data: booking
      });
    } else if (type === 'confirmed') {
      try {
        const validStatuses = ['confirmed', 'active', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid status for confirmed booking. Must be one of: confirmed, active, completed, cancelled'
          });
        }

        const confirmedBooking = await ConfirmedBooking.findOne({
          where: { 
            id,
            owner_id
          }
        });

        if (!confirmedBooking) {
          return res.status(404).json({
            success: false,
            message: 'Confirmed booking not found or unauthorized'
          });
        }

        await confirmedBooking.update({ status });

        res.status(200).json({
          success: true,
          message: 'Confirmed booking status updated successfully',
          data: confirmedBooking
        });
      } catch (confirmedError) {
        return res.status(400).json({
          success: false,
          message: 'Confirmed bookings feature not available yet'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking type'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message
    });
  }
};

exports.createBooking = async (req, res) => {
  try {
    
    const {
      fullName,
      email,
      phoneNumber,
      companyName,
      preferredContactMethod,
      preferredContactTime,
      preferredStartDate,
      message,
      warehouse_id
    } = req.body;

    // Validate required fields
    if (!warehouse_id || !fullName || !email || !phoneNumber || !companyName) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing'
      });
    }

    // Get warehouse to fetch owner_id and warehouse details
    const warehouse = await Warehouse.findOne({
      where: { id: warehouse_id },
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    if (!warehouse.owner_id) {
      return res.status(400).json({
        success: false,
        message: 'Warehouse owner information not found'
      });
    }

    // Generate a booking reference number
    const bookingReference = `INQ${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create the booking inquiry
    const booking = await Booking.create({
      fullName,
      email,
      phoneNumber,
      companyName,
      preferredContactMethod,
      preferredContactTime,
      preferredStartDate,
      message: message || 'Payment was cancelled - Customer is interested in this warehouse.',
      status: 'pending',
      warehouse_id,
      owner_id: warehouse.owner_id
    });


    // Send emails for payment cancelled inquiry
    try {
      
      // Email to customer - payment pending
      await sendConfirmationEmail({
        to: email,
        type: 'customer_payment_pending',
        booking: {
          ...booking.toJSON(),
          booking_number: bookingReference,
          booking_reference: bookingReference
        },
        warehouse: warehouse,
        customer: {
          name: fullName,
          email: email,
          phone: phoneNumber,
          company: companyName
        }
      });

      // Email to warehouse owner - inquiry received
      await sendConfirmationEmail({
        to: warehouse.owner.email,
        type: 'owner_payment_cancelled_inquiry',
        booking: {
          ...booking.toJSON(),
          booking_number: bookingReference,
          booking_reference: bookingReference
        },
        warehouse: warehouse,
        customer: {
          name: fullName,
          email: email,
          phone: phoneNumber,
          company: companyName
        }
      });

    } catch (emailError) {
      // Don't fail the booking creation if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Booking inquiry submitted successfully. Our team will contact you soon!',
      data: {
        ...booking.toJSON(),
        booking_reference: bookingReference,
        warehouse_name: warehouse.name,
        payment_status: 'pending',
        type: 'inquiry'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create booking inquiry',
      error: error.message
    });
  }
};

exports.getBookingStats = async (req, res) => {
  try {
    const owner_id = req.user.id;

    const [
      totalInquiries, 
      pendingInquiries, 
      contactedInquiries, 
      resolvedInquiries
    ] = await Promise.all([
      Booking.count({ where: { owner_id } }),
      Booking.count({ where: { owner_id, status: 'pending' } }),
      Booking.count({ where: { owner_id, status: 'contacted' } }),
      Booking.count({ where: { owner_id, status: 'resolved' } })
    ]);

    let totalConfirmed = 0;
    let activeConfirmed = 0;
    let completedConfirmed = 0;
    let totalRevenue = 0;

    // Try to get confirmed booking stats if table exists
    try {
      const [confirmed, active, completed] = await Promise.all([
        ConfirmedBooking.count({ where: { owner_id } }),
        ConfirmedBooking.count({ where: { owner_id, status: 'active' } }),
        ConfirmedBooking.count({ where: { owner_id, status: 'completed' } })
      ]);

      totalConfirmed = confirmed;
      activeConfirmed = active;
      completedConfirmed = completed;

      // Calculate total revenue
      const confirmedBookings = await ConfirmedBooking.findAll({
        where: { owner_id },
        attributes: ['amount_paid']
      });

      totalRevenue = confirmedBookings.reduce((sum, booking) => sum + (booking.amount_paid || 0), 0);
    } catch (confirmedError) {
      // Continue with default values
    }

    res.status(200).json({
      success: true,
      data: {
        // Legacy fields for compatibility
        total_bookings: totalInquiries + totalConfirmed,
        total_booking_requests: totalInquiries,
        pending_bookings: pendingInquiries,
        contacted_bookings: contactedInquiries,
        resolved_bookings: resolvedInquiries,
        
        // New detailed stats
        inquiries: {
          total: totalInquiries,
          pending: pendingInquiries,
          contacted: contactedInquiries,
          resolved: resolvedInquiries
        },
        confirmed_bookings: {
          total: totalConfirmed,
          active: activeConfirmed,
          completed: completedConfirmed
        },
        revenue: {
          total: totalRevenue,
          formatted: `₹${(totalRevenue / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
        },
        
        // Updated legacy fields
        total_confirmed_bookings: totalConfirmed,
        total_revenue: totalRevenue,
        revenue_formatted: `₹${(totalRevenue / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking statistics'
    });
  }
};