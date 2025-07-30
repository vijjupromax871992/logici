const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [10, 15]
    }
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 200]
    }
  },
  preferredContactMethod: {
    type: DataTypes.ENUM('email', 'phone'),
    allowNull: true,
    defaultValue: 'email'
  },
  preferredContactTime: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  },
  status: {
    type: DataTypes.ENUM('new', 'contacted', 'in_progress', 'completed', 'closed'),
    allowNull: false,
    defaultValue: 'new'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  contactedBy: {
    type: DataTypes.STRING(36),
    allowNull: true
    // Note: Foreign key constraint will be handled by associations in index.js
  },
  contactedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'contacts',
  timestamps: true,
  indexes: [
    {
      fields: ['email']
    },
    {
      fields: ['status']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = Contact;