// models/confirmedBooking.js
'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ConfirmedBooking extends Model {
    static associate(models) {
      ConfirmedBooking.belongsTo(models.Warehouse, {
        foreignKey: 'warehouse_id',
        as: 'warehouse'
      });
      
      ConfirmedBooking.belongsTo(models.User, {
        foreignKey: 'owner_id',
        as: 'owner'
      });
      
      ConfirmedBooking.belongsTo(models.Payment, {
        foreignKey: 'payment_id',
        as: 'payment'
      });
      
      ConfirmedBooking.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        allowNull: true // For guest users
      });
    }
  }
  
  ConfirmedBooking.init({
    id: {
      type: DataTypes.STRING(36),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    booking_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
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
      type: DataTypes.ENUM('confirmed', 'active', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'confirmed'
    },
    amount_paid: {
      type: DataTypes.INTEGER, // Amount in paise
      allowNull: false
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: false
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
    },
    payment_id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: 'payments',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.STRING(36),
      allowNull: true, // Nullable for guest users
      references: {
        model: 'users',
        key: 'id'
      }
    },
    // Additional booking metadata
    booking_metadata: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ConfirmedBooking',
    tableName: 'confirmed_bookings',
    timestamps: true,
    indexes: [
      {
        fields: ['booking_number']
      },
      {
        fields: ['warehouse_id']
      },
      {
        fields: ['owner_id']
      },
      {
        fields: ['payment_id']
      },
      {
        fields: ['status']
      }
    ]
  });

  return ConfirmedBooking;
};