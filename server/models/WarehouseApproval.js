// models/warehouseApproval.js
module.exports = (sequelize, DataTypes) => {
  const WarehouseApproval = sequelize.define('WarehouseApproval', {
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
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    admin_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'warehouse_approvals',
    timestamps: true
  });

  return WarehouseApproval;
};