// server/controllers/analyticsController.js
const { 
  Warehouse, 
  WarehouseAnalytics, 
  Booking, 
  Inquiry: Inquiries,
  sequelize 
} = require('../models');
const { Op } = require('sequelize');
const rateLimit = require('express-rate-limit');

exports.getWarehouseAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;

    // Get all warehouses owned by the user
    const warehouses = await Warehouse.findAll({
      where: { owner_id: userId },
      attributes: ['id']
    });

    const warehouseIds = warehouses.map(w => w.id);

    // Base date range
    const startDateTime = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const endDateTime = endDate ? new Date(endDate) : new Date();
    
    // Set end time to end of day
    endDateTime.setHours(23, 59, 59, 999);

    // Get bookings data
    const bookings = await Booking.findAll({
      where: {
        warehouse_id: { [Op.in]: warehouseIds },
        createdAt: {
          [Op.between]: [startDateTime, endDateTime]
        }
      },
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'day', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', '*'), 'bookings']
      ],
      group: [sequelize.fn('DATE_TRUNC', 'day', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE_TRUNC', 'day', sequelize.col('createdAt')), 'ASC']]
    });


    // Get views data
    const views = await WarehouseAnalytics.findAll({
      where: {
        warehouse_id: { [Op.in]: warehouseIds },
        date: {
          [Op.between]: [startDateTime, endDateTime]
        }
      },
      attributes: [
        'date',
        [sequelize.fn('SUM', sequelize.col('views')), 'views']
      ],
      group: ['date'],
      order: [['date', 'ASC']]
    });

    // Create complete date range array
    const dateRange = [];
    const currentDate = new Date(startDateTime);
    while (currentDate <= endDateTime) {
      dateRange.push(new Date(currentDate).toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Process views data
    const viewsData = dateRange.map(date => ({
      date,
      views: views.find(v => v.date?.toISOString().split('T')[0] === date)?.get('views') || 0
    }));

    // Process bookings data
    const bookingsData = dateRange.map(date => {
      const booking = bookings.find(b => {
        const bookingDate = new Date(b.get('date')).toISOString().split('T')[0];
        return bookingDate === date;
      });
      
      return {
        date,
        bookings: booking ? Number(booking.get('bookings')) : 0
      };
    });

    // Calculate totals
    const totalViews = viewsData.reduce((sum, day) => sum + Number(day.views || 0), 0);
    const totalBookings = bookingsData.reduce((sum, day) => sum + Number(day.bookings || 0), 0);

    // Calculate trends
    const viewsTrend = totalViews > 0 ? 'up' : 'neutral';
    const bookingsTrend = totalBookings > 0 ? 'up' : 'neutral';

    // Calculate conversion rate
    const conversionRate = totalViews > 0 ? ((totalBookings / totalViews) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      overview: {
        totalViews,
        totalBookings,
        conversionRate,
        viewsTrend,
        bookingsTrend
      },
      views: viewsData,
      bookings: bookingsData
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

  exports.getWarehouseStats = async (req, res) => {
    try {
      const { warehouseId } = req.params;
      const { startDate, endDate } = req.query;
  
      // Verify warehouse ownership
      const warehouse = await Warehouse.findOne({
        where: { 
          id: warehouseId,
          owner_id: req.user.id 
        }
      });
  
      if (!warehouse) {
        return res.status(404).json({ 
          success: false, 
          message: 'Warehouse not found or unauthorized' 
        });
      }
  
      const stats = await WarehouseAnalytics.findAll({
        where: {
          warehouse_id: warehouseId,
          createdAt: {
            [Op.between]: [
              startDate || new Date(new Date().setMonth(new Date().getMonth() - 1)),
              endDate || new Date()
            ]
          }
        },
        order: [['createdAt', 'ASC']]
      });
  
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching warehouse statistics' 
      });
    }
  };
  
  // Helper functions
  const calculateConversionRate = (views, bookings) => {
    const totalViews = views.reduce((sum, day) => sum + parseInt(day.dataValues.views), 0);
    const totalBookings = bookings.reduce((sum, day) => sum + parseInt(day.dataValues.bookings), 0);
    
    if (totalViews === 0) return 0;
    return ((totalBookings / totalViews) * 100).toFixed(2);
  };
  
  const formatDateData = (data, key) => {
    return data.map(item => ({
      date: item.dataValues.date,
      [key]: parseInt(item.dataValues[key])
    }));
  };

  // Rate limiter - one view per IP per warehouse per day
exports.viewRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 1, // limit each IP to 1 request per windowMs per warehouse
  keyGenerator: (req) => `${req.ip}-${req.params.id}`, // Include warehouse ID in the key
  message: { success: false, message: 'View already recorded for this warehouse today' }
});

exports.trackWarehouseView = async (req, res) => {
  const { id } = req.params;
  const today = new Date().toISOString().split('T')[0];
  const visitorIP = req.ip;

  try {
    const warehouse = await Warehouse.findByPk(id);
    if (!warehouse) {
      return res.status(404).json({ 
        success: false, 
        message: 'Warehouse not found' 
      });
    }

    // Start a transaction
    await sequelize.transaction(async (t) => {
      // Find or create today's analytics record
      const [analytics, created] = await WarehouseAnalytics.findOrCreate({
        where: {
          warehouse_id: id,
          date: today
        },
        defaults: {
          views: 1,
          unique_visitors: 1,
          visitor_ips: [visitorIP]
        },
        transaction: t
      });

      if (!created) {
        // Check if this IP has already viewed today
        if (!analytics.visitor_ips.includes(visitorIP)) {
          await analytics.update({
            views: analytics.views + 1,
            unique_visitors: analytics.unique_visitors + 1,
            visitor_ips: [...analytics.visitor_ips, visitorIP]
          }, { transaction: t });
        } else {
          // Only increment views if IP has already been recorded
          await analytics.increment('views', { transaction: t });
        }
      }

      // Update warehouse total views
      await warehouse.increment('views', { transaction: t });
    });

    res.json({ 
      success: true,
      message: 'View tracked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to track view'
    });
  }
};