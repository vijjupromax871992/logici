// publicWarehouseController.js
const { Warehouse, User, WarehouseAnalytics, sequelize } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// Utility functions
const getBaseUrl = () => {
    return process.env.CLIENT_URL || 'https://logic-i.com';
};

const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const baseUrl = getBaseUrl();
    return `${baseUrl}/${imagePath}`;
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
            .filter(Boolean)
            .map(getFullImageUrl);
    }

    return [];
};

// Search warehouses with auto-suggestions
exports.searchWarehouses = async (req, res) => {
    const { query, limit = 10 } = req.query;
    
    if (!query || query.length < 3) {
        return res.status(400).json({
            success: false,
            message: 'Query must be at least 3 characters long'
        });
    }

    try {
        const searchPattern = `%${query}%`;
        
        const warehouses = await Warehouse.findAll({
            where: {
                approval_status: 'approved',
                [Op.or]: [
                    { name: { [Op.like]: searchPattern } },
                    { city: { [Op.like]: searchPattern } },
                    { state: { [Op.like]: searchPattern } },
                    { description: { [Op.like]: searchPattern } },
                    { warehouse_type: { [Op.like]: searchPattern } },
                    { address: { [Op.like]: searchPattern } }
                ]
            },
            attributes: ['id', 'name', 'city', 'state', 'warehouse_type', 'description'],
            limit: parseInt(limit),
            order: [['name', 'ASC']]
        });

        const suggestions = warehouses.map(warehouse => ({
            id: warehouse.id,
            name: warehouse.name,
            location: `${warehouse.city}, ${warehouse.state}`,
            type: warehouse.warehouse_type,
            description: warehouse.description?.substring(0, 100) + '...'
        }));

        res.status(200).json({
            success: true,
            data: suggestions
        });
    } catch (error) {
        logger.error(`Error in searchWarehouses: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Failed to search warehouses'
        });
    }
};

// Fetch public warehouses with pagination and filters
exports.getPublicWarehouses = async (req, res) => {
    const { 
        page = 1, 
        limit = 10, 
        location, 
        warehouse_type, 
        sizeRange, 
        budgetRange,
        search
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Create fingerprint to identify anonymous users
    const visitorId = req.headers['x-visitor-id'] || req.ip;

    try {
        const filter = {
            // Only show approved warehouses to public users
            approval_status: 'approved'
        };
        
        // Apply search filter
        if (search) {
            const searchPattern = `%${search}%`;
            filter[Op.or] = [
                { name: { [Op.like]: searchPattern } },
                { city: { [Op.like]: searchPattern } },
                { state: { [Op.like]: searchPattern } },
                { description: { [Op.like]: searchPattern } },
                { warehouse_type: { [Op.like]: searchPattern } },
                { address: { [Op.like]: searchPattern } }
            ];
        }
        
        // Apply filters
        if (location) filter.city = { [Op.like]: `%${location}%` };
        if (warehouse_type) filter.warehouse_type = warehouse_type;
        if (sizeRange) {
            const [minSize, maxSize] = sizeRange.split(',').map(Number);
            filter.build_up_area = { [Op.between]: [minSize, maxSize] };
        }
        if (budgetRange) {
            const [minBudget, maxBudget] = budgetRange.split(',').map(Number);
            filter.rent = { [Op.between]: [minBudget, maxBudget] };
        }

        // Fetch warehouses with applied filters
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

        // Process images for display
        const processedWarehouses = warehouses.map(warehouse => {
            const warehouseData = warehouse.toJSON();
            // Convert image paths to full URLs
            if (warehouseData.images) {
                warehouseData.images = warehouseData.images;
            }
            return warehouseData;
        });

        res.status(200).json({ 
            success: true, 
            data: processedWarehouses, 
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        });
    } catch (error) {
        logger.error(`Error in getPublicWarehouses: ${error.message}`);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch warehouses' 
        });
    }
};

// Fetch public warehouse by ID
exports.getPublicWarehouseById = async (req, res) => {
    const { id } = req.params;
    
    try {
        const warehouse = await Warehouse.findOne({
            where: { 
                id,
                approval_status: 'approved' // Only show approved warehouses
            }
        });

        if (!warehouse) {
            return res.status(404).json({ 
                success: false, 
                message: 'Warehouse not found or not available' 
            });
        }

        const warehouseData = warehouse.toJSON();
        
        // Process images for display
        warehouseData.images = processImages(warehouseData.images);

        res.status(200).json({ 
            success: true, 
            data: warehouseData 
        });
    } catch (error) {
        logger.error(`Error in getPublicWarehouseById: ${error.message}`);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch warehouse details' 
        });
    }
};

// Track warehouse view with unique visitor tracking
exports.trackWarehouseView = async (req, res) => {
    const { id } = req.params;
    const today = new Date().toISOString().split('T')[0];
    
    // Create fingerprint to identify anonymous users
    const visitorId = req.headers['x-visitor-id'] || req.ip || 'anonymous';
    
    try {
        const warehouse = await Warehouse.findByPk(id);
        if (!warehouse) {
            return res.status(404).json({ 
                success: false, 
                message: 'Warehouse not found' 
            });
        }

        await sequelize.transaction(async (t) => {
            // Always increment total views counter
            await warehouse.increment('views', { transaction: t });

            // Find or create today's analytics record
            const [analytics, created] = await WarehouseAnalytics.findOrCreate({
                where: {
                    warehouse_id: id,
                    date: today
                },
                defaults: {
                    views: 1,
                    unique_visitors: 1,
                    unique_visitors_list: JSON.stringify([visitorId])
                },
                transaction: t
            });

            if (!created) {
                // Always increment total views
                await analytics.increment('views', { transaction: t });
                
                // Check if this visitor is unique for today
                let uniqueVisitorsList = [];
                try {
                    uniqueVisitorsList = JSON.parse(analytics.unique_visitors_list || '[]');
                } catch (e) {
                    uniqueVisitorsList = [];
                }
                
                // If this visitor hasn't been counted yet today
                if (!uniqueVisitorsList.includes(visitorId)) {
                    uniqueVisitorsList.push(visitorId);
                    await analytics.update({
                        unique_visitors: analytics.unique_visitors + 1,
                        unique_visitors_list: JSON.stringify(uniqueVisitorsList)
                    }, { transaction: t });
                }
            }
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