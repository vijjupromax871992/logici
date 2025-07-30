'use strict';

module.exports = (sequelize, DataTypes) => {
  const WarehouseAnalytics = sequelize.define('WarehouseAnalytics', {
    id: {
      type: DataTypes.CHAR(36),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    warehouse_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'warehouses',
        key: 'id',
        onDelete: 'CASCADE'
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    unique_visitors: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    visitor_ips: {
      type: DataTypes.TEXT,
      defaultValue: '[]',
      get() {
        const rawValue = this.getDataValue('visitor_ips');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('visitor_ips', JSON.stringify(value));
      }
    },
    inquiries: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    bookings: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    conversion_rate: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    bounce_rate: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    average_time_spent: {
      type: DataTypes.INTEGER, // in seconds
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'WarehouseAnalytics',
    tableName: 'warehouse_analytics',
    timestamps: true,
    indexes: [
      {
        fields: ['warehouse_id']
      },
      {
        fields: ['date']
      },
      {
        fields: ['warehouse_id', 'date'],
        unique: true
      }
    ]
  });


  return WarehouseAnalytics;
};