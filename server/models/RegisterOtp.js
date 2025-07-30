// Location: src/models/RegisterOTP.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class RegisterOTP extends Model {}

RegisterOTP.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    identifier: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    identifier_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['email', 'mobileNumber']], 
      },
    },
    otp_code: {
      type: DataTypes.STRING(6),
      allowNull: false,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    verification_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'RegisterOTP',
    tableName: 'registration_otps',
    timestamps: true,
    hooks: {
      afterCreate: () => {
      },
      afterUpdate: () => {
      },
      afterSync: () => {
      },
    },
  }
);

module.exports = RegisterOTP;