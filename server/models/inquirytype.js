'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class InquiryType extends Model {
    static associate(models) {
      // Define associations
      InquiryType.belongsTo(models.Warehouse, {
        foreignKey: 'warehouse_id',
        as: 'warehouse'
      });
      
      InquiryType.hasMany(models.Inquiry, {
        foreignKey: 'inquiry_type_id',
        as: 'inquiries'
      });
    }
  }
  
  InquiryType.init({
    id: {
      type: DataTypes.STRING(36),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    warehouse_id: {
      type: DataTypes.STRING(36),
      allowNull: true,
      references: {
        model: 'warehouses',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  }, {
    sequelize,
    modelName: 'InquiryType',
    tableName: 'inquiry_types',
    timestamps: true,
    underscored: true
  });

  return InquiryType;
};