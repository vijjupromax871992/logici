'use strict';
const { Model, DataTypes, Sequelize } = require('sequelize');

class User extends Model {}

User.init({
  id: {
    type: DataTypes.STRING(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  mobileNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { is: /^[0-9]{10}$/ }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  role_id: {
    type: DataTypes.STRING(36),
    references: {
      model: 'roles',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  google_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    allowNull: true,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    allowNull: true,
  },
  profilePhoto: {
    type: DataTypes.STRING,
    allowNull: true
  },
}, {
  sequelize: require('../config/database'),
  tableName: 'users',
  timestamps: true,
  hooks: {
    afterCreate: () => {
    },
    afterUpdate: () => {
    },
    afterSync: () => {
    },
  },
});

module.exports = User;