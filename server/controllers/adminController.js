// controllers/adminController.js - FIXED FOR MISSING TABLES AND ASSOCIATIONS
const { User, Warehouse, Booking, ConfirmedBooking, Payment, WarehouseApproval, ActivityLog, WarehouseAnalytics } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');
const adminUserService = require('../auth/services/adminUserService');

exports.getDashboardAnalytics = async (req, res) => {
    try {
        let totalConfirmedBookings = 0;
        
        // Try to get confirmed bookings count if table exists
        try {
            totalConfirmedBookings = await ConfirmedBooking.count();
        } catch (error) {
        }

        const [totalUsers, totalWarehouses, totalBookingInquiries, pendingApprovals] = await Promise.all([
            User.count(),
            Warehouse.count(),
            Booking.count(),
            Warehouse.count({ where: { approval_status: 'pending' } })
        ]);

        res.json({
            success: true,
            data: {
                totalUsers,
                totalWarehouses,
                totalBookings: totalBookingInquiries + totalConfirmedBookings,
                totalBookingInquiries,
                totalConfirmedBookings,
                pendingApprovals
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching dashboard analytics' });
    }
};

exports.getPendingWarehouses = async (req, res) => {
    try {
        const pendingWarehouses = await Warehouse.findAll({
            where: { approval_status: 'pending' },
            include: [{
                model: User,
                as: 'owner',
                attributes: ['firstName', 'lastName', 'email']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, data: pendingWarehouses });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching pending warehouses' });
    }
};

exports.approveWarehouse = async (req, res) => {
    const { id } = req.params;
    try {
        const warehouse = await Warehouse.findByPk(id);
        if (!warehouse) {
            return res.status(404).json({ success: false, message: 'Warehouse not found' });
        }

        await sequelize.transaction(async (t) => {
            // Update warehouse status
            await warehouse.update({ 
                approval_status: 'approved' 
            }, { transaction: t });

            // Update approval record if it exists
            try {
                await WarehouseApproval.update({
                    status: 'approved',
                    admin_id: req.admin.id
                }, {
                    where: { warehouse_id: id },
                    transaction: t
                });
            } catch (approvalError) {
            }

            // Log activity
            await ActivityLog.create({
                user_id: req.admin.id,
                action_type: 'WAREHOUSE_APPROVAL',
                entity_type: 'WAREHOUSE',
                entity_id: id,
                details: { status: 'approved' }
            }, { transaction: t });
        });

        res.json({ success: true, message: 'Warehouse approved successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error approving warehouse' });
    }
};

exports.rejectWarehouse = async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    
    try {
        const warehouse = await Warehouse.findByPk(id);
        if (!warehouse) {
            return res.status(404).json({ success: false, message: 'Warehouse not found' });
        }

        await warehouse.update({ 
            approval_status: 'rejected',
            rejection_reason: reason
        });

        // Log activity
        await ActivityLog.create({
            user_id: req.admin.id,
            action_type: 'WAREHOUSE_REJECTION',
            entity_type: 'WAREHOUSE',
            entity_id: id,
            details: { status: 'rejected', reason }
        });

        res.json({ success: true, message: 'Warehouse rejected successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error rejecting warehouse' });
    }
};

exports.getUserAnalytics = async (req, res) => {
    try {
        const userStats = await User.findAll({
            attributes: [
                [sequelize.fn('date_trunc', 'month', sequelize.col('createdAt')), 'month'],
                [sequelize.fn('count', '*'), 'count']
            ],
            group: [sequelize.fn('date_trunc', 'month', sequelize.col('createdAt'))],
            order: [[sequelize.fn('date_trunc', 'month', sequelize.col('createdAt')), 'ASC']]
        });

        res.json({ success: true, data: userStats });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching user analytics' });
    }
};

exports.getWarehouseAnalytics = async (req, res) => {
    try {

        const analytics = await WarehouseAnalytics.findAll({
            include: [{
                model: Warehouse,
                as: 'warehouse',
                attributes: ['name', 'city', 'warehouse_type'] 
            }],
            order: [['views', 'DESC']]
        });


        // Transform data for frontend
        const transformedData = analytics.map(item => ({
            id: item.id,
            views: item.views || 0,
            inquiries: item.inquiries || 0,
            bookings: item.bookings || 0,
            date: item.date,
            warehouse: {
                name: item.warehouse?.name || 'Unknown',
                city: item.warehouse?.city || 'Unknown',
                warehouse_type: item.warehouse?.warehouse_type || 'Unknown' 
            }
        }));


        res.json({
            success: true,
            data: transformedData
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching warehouse analytics',
            error: error.message
        });
    }
};

exports.getActivityLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.findAll({
            include: [{
                model: User,
                as: 'user',
                attributes: ['firstName', 'lastName', 'email']
            }],
            order: [['createdAt', 'DESC']],
            limit: 100
        });

        res.json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching activity logs' });
    }
};

exports.createAdmin = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      mobileNumber,
      country,
      state,
      city,
      role_id,
      metadata,
      google_id
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !mobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing (firstName, lastName, email, password, mobileNumber)'
      });
    }

    // Check if admin already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      mobileNumber,
      country: country || null,
      state: state || null,
      city: city || null,
      role_id: role_id || null,
      isAdmin: true,
      metadata: metadata || null,
      google_id: google_id || null
    });

    // Remove password from response
    const adminResponse = {
      id: admin.id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      mobileNumber: admin.mobileNumber,
      country: admin.country,
      state: admin.state,
      city: admin.city,
      role_id: admin.role_id,
      isAdmin: admin.isAdmin,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt
    };

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: adminResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating admin user'
    });
  }
};

exports.getAdminUsers = async (req, res) => {
  try {
    const { page, limit, search, role } = req.query;
    const result = await adminUserService.getAdminUsers({
      page,
      limit,
      search,
      role
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAdminUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminUserService.getAdminUserById(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminUserService.updateAdminUser(id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminUserService.deleteAdminUser(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const result = await adminUserService.getAdminStats();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ENHANCED BOOKING MANAGEMENT METHODS - FIXED FOR MISSING ASSOCIATIONS
exports.getAllBookings = async (req, res) => {
  try {
    
    const { page = 1, limit = 10, status, search, type = 'all' } = req.query;
    const offset = (page - 1) * parseInt(limit);


    let allBookings = [];
    let totalCount = 0;

    if (type === 'all' || type === 'inquiries') {
      // Get booking inquiries - FIXED: Removed User association since it doesn't exist
      let whereClause = {};
      
      if (status) {
        // Only apply inquiry-specific statuses if type is inquiries or all
        const inquiryStatuses = ['pending', 'contacted', 'resolved'];
        if (type === 'inquiries' || (type === 'all' && inquiryStatuses.includes(status))) {
          whereClause.status = status;
        }
      }

      if (search) {
        whereClause[Op.or] = [
          { fullName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { companyName: { [Op.like]: `%${search}%` } }
        ];
      }

      const bookings = await Booking.findAll({
        where: whereClause,
        include: [
          {
            model: Warehouse,
            as: 'warehouse',
            attributes: ['id', 'name', 'city', 'state', 'warehouse_type', 'address'],
            required: false
          }
          // REMOVED: User association since Booking doesn't have user_id
        ],
        order: [['createdAt', 'DESC']]
      });

      const transformedBookings = bookings.map(booking => ({
        ...booking.toJSON(),
        type: 'inquiry',
        booking_type: 'inquiry',
        amount_paid: 0,
        payment_status: 'unpaid',
        payment_method: null,
        payment_date: null,
        booking_number: null,
        is_paid: false
      }));

      allBookings = [...allBookings, ...transformedBookings];
      totalCount += bookings.length;
    }

    if (type === 'all' || type === 'confirmed') {
      // Get confirmed bookings - with proper error handling
      try {
        let confirmedWhereClause = {};
        
        if (status) {
          // Only apply confirmed-specific statuses if type is confirmed or all
          const confirmedStatuses = ['confirmed', 'active', 'completed', 'cancelled'];
          if (type === 'confirmed' || (type === 'all' && confirmedStatuses.includes(status))) {
            confirmedWhereClause.status = status;
          }
        }

        if (search) {
          confirmedWhereClause[Op.or] = [
            { fullName: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { companyName: { [Op.like]: `%${search}%` } }
          ];
        }

        const confirmedBookings = await ConfirmedBooking.findAll({
          where: confirmedWhereClause,
          include: [
            {
              model: Warehouse,
              as: 'warehouse',
              attributes: ['id', 'name', 'city', 'state', 'warehouse_type', 'address'],
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

        const transformedConfirmedBookings = confirmedBookings.map(booking => ({
          ...booking.toJSON(),
          type: 'confirmed',
          booking_type: 'confirmed',
          payment_status: 'paid',
          is_paid: true
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


    res.json({
      success: true,
      data: paginatedBookings,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount / parseInt(limit))
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

exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const { type = 'inquiry' } = req.query;

    let booking;

    if (type === 'inquiry') {
      booking = await Booking.findByPk(id, {
        include: [
          {
            model: Warehouse,
            as: 'warehouse',
            attributes: ['id', 'name', 'city', 'state', 'warehouse_type', 'address'],
            required: false
          }
        ]
      });

      if (booking) {
        booking = {
          ...booking.toJSON(),
          type: 'inquiry',
          booking_type: 'inquiry',
          is_paid: false
        };
      }
    } else if (type === 'confirmed') {
      try {
        booking = await ConfirmedBooking.findByPk(id, {
          include: [
            {
              model: Warehouse,
              as: 'warehouse',
              attributes: ['id', 'name', 'city', 'state', 'warehouse_type', 'address'],
              required: false
            },
            {
              model: Payment,
              as: 'payment',
              attributes: ['razorpay_payment_id', 'payment_method', 'amount'],
              required: false
            }
          ]
        });

        if (booking) {
          booking = {
            ...booking.toJSON(),
            type: 'confirmed',
            booking_type: 'confirmed',
            is_paid: true
          };
        }
      } catch (confirmedError) {
        return res.status(400).json({
          success: false,
          message: 'Confirmed bookings feature not available yet'
        });
      }
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, type = 'inquiry' } = req.body;

    let booking;
    let updateData = { status };
    if (notes) {
      updateData.adminNotes = notes;
    }

    if (type === 'inquiry') {
      booking = await Booking.findByPk(id);
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking inquiry not found'
        });
      }

      await booking.update(updateData);
    } else if (type === 'confirmed') {
      try {
        booking = await ConfirmedBooking.findByPk(id);
        
        if (!booking) {
          return res.status(404).json({
            success: false,
            message: 'Confirmed booking not found'
          });
        }

        await booking.update(updateData);
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

    // Log the admin action
    await ActivityLog.create({
      user_id: req.admin.id,
      action_type: 'BOOKING_STATUS_UPDATE',
      entity_type: type === 'inquiry' ? 'BOOKING_INQUIRY' : 'CONFIRMED_BOOKING',
      entity_id: id,
      details: { status, notes, type }
    });


    res.json({
      success: true,
      data: booking,
      message: `${type === 'inquiry' ? 'Booking inquiry' : 'Confirmed booking'} status updated to ${status}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message
    });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { type = 'inquiry' } = req.body;

    let booking;

    if (type === 'inquiry') {
      booking = await Booking.findByPk(id);
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking inquiry not found'
        });
      }

      await booking.destroy();
    } else if (type === 'confirmed') {
      try {
        booking = await ConfirmedBooking.findByPk(id);
        
        if (!booking) {
          return res.status(404).json({
            success: false,
            message: 'Confirmed booking not found'
          });
        }

        await booking.destroy();
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

    // Log the admin action
    await ActivityLog.create({
      user_id: req.admin.id,
      action_type: 'BOOKING_DELETION',
      entity_type: type === 'inquiry' ? 'BOOKING_INQUIRY' : 'CONFIRMED_BOOKING',
      entity_id: id,
      details: { action: 'deleted', type }
    });


    res.json({
      success: true,
      message: `${type === 'inquiry' ? 'Booking inquiry' : 'Confirmed booking'} deleted successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete booking',
      error: error.message
    });
  }
};

exports.bulkUpdateBookingStatus = async (req, res) => {
  try {
    const { bookingIds, status, type = 'inquiry' } = req.body;

    if (!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking IDs provided'
      });
    }

    let result;

    if (type === 'inquiry') {
      result = await Booking.update(
        { status },
        {
          where: {
            id: {
              [Op.in]: bookingIds
            }
          }
        }
      );
    } else if (type === 'confirmed') {
      try {
        result = await ConfirmedBooking.update(
          { status },
          {
            where: {
              id: {
                [Op.in]: bookingIds
              }
            }
          }
        );
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

    // Log the admin action
    await ActivityLog.create({
      user_id: req.admin.id,
      action_type: 'BOOKING_BULK_UPDATE',
      entity_type: type === 'inquiry' ? 'BOOKING_INQUIRY' : 'CONFIRMED_BOOKING',
      entity_id: null,
      details: { bookingIds, status, count: result[0], type }
    });


    res.json({
      success: true,
      message: `Updated ${result[0]} ${type === 'inquiry' ? 'booking inquiries' : 'confirmed bookings'} to ${status}`,
      data: { updatedCount: result[0] }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update booking status',
      error: error.message
    });
  }
};