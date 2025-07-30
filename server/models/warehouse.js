'use strict';
const { Model, Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Warehouse extends Model {
        static associate(models) {
            // Maintain all associations from PostgreSQL version
            Warehouse.belongsTo(models.User, {
                foreignKey: 'owner_id',
                as: 'owner',
                onDelete: 'SET NULL',
            });
            Warehouse.hasMany(models.InquiryType, {
                foreignKey: 'warehouse_id',
                as: 'inquiries',
            });
            Warehouse.hasOne(models.WarehouseApproval, {
                foreignKey: 'warehouse_id',
                as: 'approval'
            });
            Warehouse.hasMany(models.WarehouseAnalytics, {
                foreignKey: 'warehouse_id',
                as: 'analytics'
            });
        }
    }

    Warehouse.init(
        {
            id: {
                type: DataTypes.STRING(36),
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
            approval_status: {
                type: DataTypes.STRING,
                defaultValue: 'pending',
                allowNull: false,
                validate: {
                    isIn: [['pending', 'approved', 'rejected']]
                }
            },
            rejection_reason: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            mobile_number: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: { isEmail: true },
            },
            ownership_type: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    isIn: [['Broker', 'Owner']]
                }
            },
            address: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            city: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            state: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            pin_code: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            warehouse_type: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    isIn: [
                        [
                            'Standard or General Storage',
                            'Hazardous Chemicals Storage',
                            'Climate Controlled Storage'
                        ]
                    ]
                }
            },
            build_up_area: {
                type: DataTypes.FLOAT,
                allowNull: false,
            },
            total_plot_area: {
                type: DataTypes.FLOAT,
                allowNull: true,
            },
            total_parking_area: {
                type: DataTypes.FLOAT,
                allowNull: true,
            },
            plot_status: {
                type: DataTypes.STRING,
                allowNull: true, // Keeping original nullability
                validate: {
                    isIn: [['Agricultural', 'Commercial', 'Industrial', 'Residential']]
                }
            },
            listing_for: {
                type: DataTypes.STRING,
                allowNull: true, // Keeping original nullability
                validate: {
                    isIn: [['Rent', 'Sale']]
                }
            },
            plinth_height: {
                type: DataTypes.FLOAT,
                allowNull: true,
            },
            dock_doors: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            electricity_kva: {
                type: DataTypes.FLOAT,
                allowNull: true,
            },
            additional_details: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            floor_plans: {
                type: DataTypes.STRING,
                allowNull: true,
                validate: {
                    isIn: [['Ground Floor', 'First Floor', 'Second Floor']]
                }
            },            
            rent: {
                type: DataTypes.FLOAT,
                allowNull: true,
            },
            deposit: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            comments: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            images: {
                type: DataTypes.TEXT,
                allowNull: true,
                get() {
                    const rawValue = this.getDataValue('images');
                    if (!rawValue) return [];
                    try {
                        if (rawValue.includes('[')) {
                            return JSON.parse(rawValue);
                        }
                        return rawValue.split(',').map(img => img.trim()).filter(Boolean);
                    } catch (e) {
                        return rawValue ? [rawValue] : [];
                    }
                },
                set(value) {
                    if (!value) {
                        this.setDataValue('images', null);
                        return;
                    }
                    if (Array.isArray(value)) {
                        this.setDataValue('images', value.join(','));
                    } else if (typeof value === 'string') {
                        this.setDataValue('images', value);
                    }
                },
                validate: {
                    maxImages(value) {
                        if (!value) return;
                        const imageCount = typeof value === 'string' 
                            ? value.split(',').length 
                            : Array.isArray(value) ? value.length : 0;
                        if (imageCount > 5) {
                            throw new Error('Maximum 5 images allowed');
                        }
                    }
                }
            },
            views: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: true
            },
            owner_id: {
                type: DataTypes.STRING(36), // Changed from UUID to STRING(36)
                allowNull: true, 
                references: {
                    model: 'users',
                    key: 'id',
                },
                onDelete: 'SET NULL', 
            },
        },
        {
            sequelize,
            modelName: 'Warehouse',
            tableName: 'warehouses',
            timestamps: true,
            underscored: true,
        }
    );

    return Warehouse;
};