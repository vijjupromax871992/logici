const multer = require('multer');
const path = require('path');
const { Warehouse, WarehouseApproval, User, WarehouseAnalytics} = require('../models');
const logger = require('../utils/logger');
const { Sequelize } = require('sequelize');
const { Op } = require('sequelize');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2MB
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed!'));
        }
    },
});

const sanitizeWarehouseData = (data) => {
    const sanitized = {};
    
    // Handle numeric fields
    const numericFields = ['build_up_area', 'total_plot_area', 'total_parking_area', 
      'plinth_height', 'electricity_kva', 'rent', 'deposit', 'dock_doors', 'pin_code'];
    
    numericFields.forEach(field => {
      if (data[field] === 'null' || data[field] === '') {
        sanitized[field] = null;
      } else {
        const num = Number(data[field]);
        sanitized[field] = isNaN(num) ? null : num;
      }
    });
  
    // Handle ENUM fields
    const enumFields = ['plot_status', 'listing_for', 'floor_plans', 'ownership_type', 'warehouse_type'];
    enumFields.forEach(field => {
      sanitized[field] = data[field] === 'null' || data[field] === '' ? null : data[field];
    });
  
    // Handle text fields
    const textFields = ['name', 'mobile_number', 'email', 'address', 'city', 'state', 
      'description', 'comments', 'rejection_reason'];
    textFields.forEach(field => {
      sanitized[field] = data[field] === 'null' ? null : data[field];
    });
  
    return sanitized;
  };

// Utility functions
const getBaseUrl = () => {
    return process.env.CLIENT_URL || 'https://logic-i.com';
};

const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // Avoid duplicating base URL if already present
    if (imagePath.startsWith('http')) return imagePath;

    const baseUrl = getBaseUrl();
    return `${baseUrl}/${imagePath.replace(/\\/g, '/')}`; // Convert backslashes to forward slashes
};


const processImages = (imagesData) => {
    if (!imagesData) return [];

    if (typeof imagesData === 'string') {
        return imagesData.split(',')
            .map(img => img.trim())
            .filter(Boolean)
            .map(getFullImageUrl);
    }

    if (Array.isArray(imagesData)) {
        return imagesData
            .map(img => img.trim())  
            .filter(Boolean)
            .map(getFullImageUrl);
    }

    return [];
};


// Fetch city/state suggestions
exports.getCityStateSuggestions = async (req, res) => {
    const { query } = req.query;
    try {
        const results = await Warehouse.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('city')), 'city']],
            where: {
                city: {
                    [Sequelize.Op.iLike]: `%${query}%`,
                },
            },
            limit: 10,
        });
        const suggestions = results.map((result) => result.city.trim());
        res.json(suggestions);
    } catch (error) {
        logger.error(`Error fetching city/state suggestions: ${error.message}`);
        res.status(500).json({ error: 'Server error' });
    }
};

// Fetch warehouses with pagination and filters
exports.getWarehouses = async (req, res) => {
    const { 
        page = 1, 
        limit = 10, 
        location, 
        warehouse_type, 
        sizeRange, 
        budgetRange,
        showAll = false 
    } = req.query;
    
    const offset = (page - 1) * limit;

    try {
        const filter = {};
        
        // Apply basic filters
        if (location) filter.city = { [Op.iLike]: `%${location}%` };
        if (warehouse_type) filter.warehouse_type = warehouse_type;
        if (sizeRange) {
            const [minSize, maxSize] = sizeRange.split(',').map(Number);
            filter.build_up_area = { [Op.between]: [minSize, maxSize] };
        }
        if (budgetRange) {
            const [minBudget, maxBudget] = budgetRange.split(',').map(Number);
            filter.rent = { [Op.between]: [minBudget, maxBudget] };
        }

        // Handle visibility based on user role and ownership
        if (!showAll) {
            filter[Op.or] = [
                { owner_id: req.userId }, // User's own warehouses
            ];
        }

        const { rows: warehouses, count } = await Warehouse.findAndCountAll({
            where: filter,
            include: [{
                model: User,
                as: 'owner',
                attributes: ['firstName', 'lastName', 'email']
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ 
            success: true, 
            data: warehouses, 
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        });
    } catch (error) {
        logger.error(`Error in getWarehouses: ${error.message}`);
        res.status(500).json({ success: false, message: 'Failed to fetch warehouses' });
    }
};

// Get warehouse analytics
exports.getWarehouseAnalytics = async (req, res) => {
    try {
        // Get user's warehouses with their analytics
        const warehouses = await Warehouse.findAll({
            where: { owner_id: req.userId },
            include: [{
                model: WarehouseAnalytics,
                as: 'analytics',
                required: false
            }],
            attributes: [
                'id',
                'name',
                'approval_status',
                'createdAt',
                'views'
            ]
        });

        // Generate daily performance data for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const performance = [];
        const today = new Date();

        // Generate daily entries
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            // Sum the views for this date from all warehouses
            const dailyViews = warehouses.reduce((sum, warehouse) => {
                const analytics = warehouse.analytics ? 
                    warehouse.analytics.find(a => 
                        new Date(a.createdAt).toISOString().split('T')[0] === dateStr
                    ) : null;
                return sum + (analytics ? analytics.views : 0);
            }, 0);

            performance.unshift({
                date: dateStr,
                views: dailyViews
            });
        }

        // Calculate status distribution
        const distribution = [
            {
                name: 'Approved',
                value: warehouses.filter(w => w.approval_status === 'approved').length
            },
            {
                name: 'Pending',
                value: warehouses.filter(w => w.approval_status === 'pending').length
            },
            {
                name: 'Rejected',
                value: warehouses.filter(w => w.approval_status === 'rejected').length
            }
        ];

        res.json({
            success: true,
            data: {
                performance,
                distribution,
                totalWarehouses: warehouses.length,
                totalViews: warehouses.reduce((sum, w) => sum + (w.views || 0), 0)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics data',
            details: error.message
        });
    }
};

// Get warehouse stats
exports.getWarehouseStats = async (req, res) => {
    try {
        const warehouses = await Warehouse.findAll({
            where: { owner_id: req.userId }
        });

        const stats = {
            totalWarehouses: warehouses.length,
            approvedWarehouses: warehouses.filter(w => w.approval_status === 'approved').length,
            pendingWarehouses: warehouses.filter(w => w.approval_status === 'pending').length,
            totalViews: warehouses.reduce((sum, w) => sum + (w.views || 0), 0)
        };

        res.json({ success: true, data: stats });
    } catch (error) {
        logger.error('Error fetching warehouse stats:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch warehouse stats' 
        });
    }
};

// Fetch warehouse by ID
exports.getWarehouseById = async (req, res) => {
    const { id } = req.params;
    try {
        const warehouse = await Warehouse.findByPk(id);
        if (!warehouse) {
            return res.status(404).json({ success: false, message: 'Warehouse not found' });
        }

        const warehouseData = warehouse.toJSON();

        // Process images
        warehouseData.images = processImages(warehouseData.images);

        res.status(200).json({ success: true, data: warehouseData });
    } catch (error) {
        logger.error(`Error in getWarehouseById: ${error.message}`);
        res.status(500).json({ success: false, message: 'Failed to fetch warehouse' });
    }
};

// Create a new warehouse
exports.createWarehouse = async (req, res) => {
    const sequelize = require('../config/database');
    
    try {
        logger.debug('Request Body:', req.body);
        logger.debug('Uploaded Files:', req.files);
        logger.debug('User ID from token:', req.userId);

        if (!req.userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
        }

        // Process images
        let imagesArray = [];
        if (req.files && req.files.length > 0) {
            imagesArray = req.files.map(file => file.path);
            
            if (imagesArray.length > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Maximum 5 images allowed'
                });
            }
        }

        // Process additional details
        let parsedAdditionalDetails = {};
        if (req.body.additional_details) {
            try {
                parsedAdditionalDetails = JSON.parse(req.body.additional_details);
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid JSON in additional_details'
                });
            }
        }

        // Start a transaction
        const result = await sequelize.transaction(async (t) => {
            // Create warehouse with processed data
            const newWarehouse = await Warehouse.create({
                ...req.body,
                images: imagesArray, // Model will handle conversion to string
                additional_details: parsedAdditionalDetails,
                owner_id: req.userId,
                approval_status: 'pending'
            }, { transaction: t });

            // Create approval record
            await WarehouseApproval.create({
                warehouse_id: newWarehouse.id,
                status: 'pending'
            }, { transaction: t });

            return newWarehouse;
        });

        logger.info(`Warehouse created successfully: ${result.id}`);
        res.status(201).json({ 
            success: true, 
            data: result,
            message: 'Warehouse created successfully and sent for approval'
        });
    } catch (error) {
        logger.error(`Error creating warehouse: ${error.message}`);
        res.status(500).json({ 
            success: false, 
            message: `Failed to create warehouse: ${error.message}` 
        });
    }
};

// Update existing warehouse
exports.updateWarehouse = async (req, res) => {
    try {
        const { id } = req.params;

        const warehouse = await Warehouse.findByPk(id);
        if (!warehouse) {
            return res.status(404).json({ success: false, message: 'Warehouse not found' });
        }

        // Process images
        let finalImages = [];
        
        // Handle existing images if provided
        if (req.body.existing_images) {
            try {
                const existingImages = JSON.parse(req.body.existing_images);
                finalImages = existingImages.filter(img => !img.startsWith('blob:')); 
            } catch (error) {
            }
        }
        
        // Add new uploaded images
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => file.path);
            finalImages = [...finalImages, ...newImages];
        }

        // Ensure we don't exceed 5 images
        if (finalImages.length > 5) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 5 images allowed'
            });
        }

        // Handle numeric fields
        const numericFields = ['build_up_area', 'total_plot_area', 'total_parking_area', 
            'plinth_height', 'electricity_kva', 'rent', 'deposit', 'dock_doors', 'pin_code'];
        
        const processedNumericFields = {};
        numericFields.forEach(field => {
            const value = req.body[field];
            processedNumericFields[field] = value === '' || value === 'null' || value === undefined 
                ? null 
                : Number(value);
        });

        // Handle ENUM fields
        const enumFields = {
            plot_status: req.body.plot_status || warehouse.plot_status,
            listing_for: req.body.listing_for || warehouse.listing_for,
            floor_plans: req.body.floor_plans || warehouse.floor_plans,
            ownership_type: req.body.ownership_type || warehouse.ownership_type,
            warehouse_type: req.body.warehouse_type || warehouse.warehouse_type
        };

        // Handle text fields
        const textFields = ['name', 'mobile_number', 'email', 'address', 'city', 'state', 
            'description', 'comments'];
        
        const processedTextFields = {};
        textFields.forEach(field => {
            processedTextFields[field] = req.body[field] || warehouse[field];
        });

        // Update warehouse
        await warehouse.update({
            ...processedTextFields,
            ...processedNumericFields,
            ...enumFields,
            images: finalImages.length > 0 ? finalImages.join(',') : null
        });

        res.status(200).json({ 
            success: true, 
            data: warehouse,
            message: 'Warehouse updated successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update warehouse',
            error: error.message 
        });
    }
};

// Delete a warehouse
exports.deleteWarehouse = async (req, res) => {
    const { id } = req.params;
    try {
        const warehouse = await Warehouse.findByPk(id);
        if (!warehouse) {
            return res.status(404).json({ success: false, message: 'Warehouse not found' });
        }
        await warehouse.destroy();
        res.status(200).json({ success: true, message: 'Warehouse deleted successfully' });
    } catch (error) {
        logger.error(`Error deleting warehouse: ${error.message}`);
        res.status(500).json({ success: false, message: 'Failed to delete warehouse' });
    }
};

// Track warehouse view
exports.trackWarehouseView = async (req, res) => {
    const { id } = req.params;
    const today = new Date().toISOString().split('T')[0];

    try {
        const warehouse = await Warehouse.findByPk(id);
        if (!warehouse) {
            return res.status(404).json({ 
                success: false, 
                message: 'Warehouse not found' 
            });
        }

        await sequelize.transaction(async (t) => {
            // Increment warehouse total views
            await warehouse.increment('views', { transaction: t });

            // Track daily analytics
            const [analytics] = await WarehouseAnalytics.findOrCreate({
                where: {
                    warehouse_id: id,
                    date: today
                },
                defaults: {
                    views: 1,
                    unique_visitors: 1
                },
                transaction: t
            });

            if (!analytics.isNewRecord) {
                await analytics.increment('views', { transaction: t });
            }
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to track view'
        });
    }
};

exports.getWarehouseAnalytics = async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      // Use either req.user.id or req.userId
      const userId = req.user?.id || req.userId;
  
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }
  
      // Get all warehouses owned by the user with their analytics
      const warehouses = await Warehouse.findAll({
        where: { owner_id: userId },
        attributes: ['id', 'name', 'approval_status', 'views'],
        include: [{
          model: WarehouseAnalytics,
          as: 'analytics',
          attributes: [
            'views', 
            'unique_visitors', 
            'inquiries', 
            'bookings',
            'conversion_rate', 
            'bounce_rate', 
            'average_time_spent', 
            'date'
          ],
          required: false, // LEFT JOIN
          where: startDate && endDate ? {
            date: {
              [Op.between]: [startDate, endDate]
            }
          } : {}
        }]
      });
  
      // Process the data - ensure analytics is always treated as an array
      const processedData = warehouses.map(warehouse => {
        // Check if analytics is an array
        const analyticsArray = Array.isArray(warehouse.analytics) 
          ? warehouse.analytics 
          : warehouse.analytics ? [warehouse.analytics] : [];
          
        return {
          id: warehouse.id,
          name: warehouse.name,
          totalViews: warehouse.views || 0,
          analytics: analyticsArray.map(a => ({
            date: a.date,
            views: a.views || 0,
            uniqueVisitors: a.unique_visitors || 0,
            inquiries: a.inquiries || 0,
            bookings: a.bookings || 0,
            conversionRate: a.conversion_rate || 0,
            bounceRate: a.bounce_rate || 0,
            averageTimeSpent: a.average_time_spent || 0
          }))
        };
      });
  
      // Prepare structured response data for frontend
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
  
      // Generate daily data arrays
      const viewsData = [];
      const bookingsData = [];
      const inquiriesData = [];
      
      // Initialize counters for overview stats
      let totalViews = 0;
      let totalBookings = 0; 
      let totalInquiries = 0;
      
      // Loop through last 30 days to create time series data
      for (let i = 0; i < 30; i++) {
        const currentDate = new Date(thirtyDaysAgo);
        currentDate.setDate(thirtyDaysAgo.getDate() + i);
        const dateString = currentDate.toISOString().split('T')[0];
        
        // Aggregate data across all warehouses for this date
        let dailyViews = 0;
        let dailyBookings = 0;
        let dailyInquiries = 0;
        
        processedData.forEach(warehouse => {
          const dayAnalytics = warehouse.analytics.find(a => 
            a.date === dateString || a.date?.split('T')[0] === dateString
          );
          
          if (dayAnalytics) {
            dailyViews += dayAnalytics.views || 0;
            dailyBookings += dayAnalytics.bookings || 0;
            dailyInquiries += dayAnalytics.inquiries || 0;
          }
        });
        
        // Add daily totals to running counters
        totalViews += dailyViews;
        totalBookings += dailyBookings;
        totalInquiries += totalInquiries;
        
        // Push data to arrays
        viewsData.push({ date: dateString, views: dailyViews });
        bookingsData.push({ date: dateString, bookings: dailyBookings });
        inquiriesData.push({ date: dateString, inquiries: dailyInquiries });
      }
      
      // Calculate conversion rate
      const conversionRate = totalViews > 0 
        ? ((totalBookings + totalInquiries) / totalViews * 100).toFixed(2)
        : 0;
        
      // Determine trends (simplified - just based on last 7 days vs previous 7 days)
      const last7DaysViews = viewsData.slice(-7).reduce((sum, day) => sum + day.views, 0);
      const previous7DaysViews = viewsData.slice(-14, -7).reduce((sum, day) => sum + day.views, 0);
      const viewsTrend = last7DaysViews >= previous7DaysViews ? 'up' : 'down';
      
      const last7DaysBookings = bookingsData.slice(-7).reduce((sum, day) => sum + day.bookings, 0);
      const previous7DaysBookings = bookingsData.slice(-14, -7).reduce((sum, day) => sum + day.bookings, 0);
      const bookingsTrend = last7DaysBookings >= previous7DaysBookings ? 'up' : 'down';
      
      const last7DaysInquiries = inquiriesData.slice(-7).reduce((sum, day) => sum + day.inquiries, 0);
      const previous7DaysInquiries = inquiriesData.slice(-14, -7).reduce((sum, day) => sum + day.inquiries, 0);
      const inquiriesTrend = last7DaysInquiries >= previous7DaysInquiries ? 'up' : 'down';
      
      const last7DaysConversion = last7DaysViews > 0
        ? ((last7DaysBookings + last7DaysInquiries) / last7DaysViews * 100)
        : 0;
      const previous7DaysConversion = previous7DaysViews > 0
        ? ((previous7DaysBookings + previous7DaysInquiries) / previous7DaysViews * 100)
        : 0;
      const conversionTrend = last7DaysConversion >= previous7DaysConversion ? 'up' : 'down';
  
      // Return structured response
      res.json({
        success: true,
        overview: {
          totalViews,
          viewsTrend,
          totalBookings,
          bookingsTrend,
          totalInquiries,
          inquiriesTrend,
          conversionRate: parseFloat(conversionRate),
          conversionTrend
        },
        views: viewsData,
        bookings: bookingsData,
        inquiries: inquiriesData,
        warehouses: processedData
      });
  
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching analytics data'
      });
    }
  };