// Location: src/models/OTP.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class OTP extends Model {}

OTP.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.CHAR(36),
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    otp_code: {
      type: DataTypes.STRING(6),
      allowNull: false,
    },
    otp_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'OTP',
    tableName: 'otps',
    timestamps: true,
  }
);

module.exports = OTP;