// /backend/models/RolePermission.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Role = require('./Role');
const Permission = require('./Permission');

const RolePermission = sequelize.define(
  'RolePermission',
  {
    roleId: {
      type: DataTypes.CHAR(36),
      references: {
        model: 'roles',
        key: 'id'
      },
      primaryKey: true
    },
    permissionId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'permissions',
        key: 'id'
      },
      primaryKey: true
    }
  },
  {
    tableName: 'role_permissions',
    timestamps: false,
  }
);

module.exports = RolePermission;