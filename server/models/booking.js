'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      // Define associations
      Booking.belongsTo(models.Warehouse, {
        foreignKey: 'warehouse_id',
        as: 'warehouse'
      });
      
      Booking.belongsTo(models.User, {
        foreignKey: 'owner_id',
        as: 'owner'
      });
    }
  }
  
  Booking.init({
    id: {
      type: DataTypes.STRING(36),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true }
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    preferredContactMethod: {
      type: DataTypes.STRING,
      allowNull: false
    },
    preferredContactTime: {
      type: DataTypes.STRING,
      allowNull: false
    },
    preferredStartDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'contacted', 'resolved']]
      }
    },
    warehouse_id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: 'warehouses',
        key: 'id'
      }
    },
    owner_id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Booking',
    tableName: 'bookings',
    timestamps: true,
    underscored: true
  });

  return Booking;
};