// models/payment.js
'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Warehouse, {
        foreignKey: 'warehouse_id',
        as: 'warehouse'
      });
      
      Payment.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        allowNull: true // For guest users
      });
    }
  }
  
  Payment.init({
    id: {
      type: DataTypes.STRING(36),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    razorpay_order_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    razorpay_payment_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    razorpay_signature: {
      type: DataTypes.STRING,
      allowNull: true
    },
    amount: {
      type: DataTypes.INTEGER, // Amount in paise (₹1000 = 100000 paise)
      allowNull: false,
      defaultValue: 100000 // ₹1000 in paise
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'INR'
    },
    status: {
      type: DataTypes.ENUM('created', 'attempted', 'paid', 'failed', 'cancelled'),
      allowNull: false,
      defaultValue: 'created'
    },
    payment_method: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gateway_response: {
      type: DataTypes.JSON,
      allowNull: true
    },
    failure_reason: {
      type: DataTypes.STRING,
      allowNull: true
    },
    warehouse_id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: 'warehouses',
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
    // Guest user details for non-registered users
    guest_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    guest_email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    guest_phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Booking details
    booking_details: {
      type: DataTypes.JSON,
      allowNull: false
    },
    receipt: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'Payment',
    tableName: 'payments',
    timestamps: true,
    indexes: [
      {
        fields: ['razorpay_order_id']
      },
      {
        fields: ['razorpay_payment_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['warehouse_id']
      }
    ]
  });

  return Payment;
};