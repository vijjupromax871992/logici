'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Inquiry extends Model {
    static associate(models) {
      // Define associations
      Inquiry.belongsTo(models.InquiryType, {
        foreignKey: 'inquiry_type_id',
        as: 'inquiryTypeDetails'
      });
      
      Inquiry.belongsTo(models.User, {
        foreignKey: 'allocated_to',
        as: 'allocatedUser'
      });
      
      Inquiry.belongsTo(models.User, {
        foreignKey: 'allocated_by',
        as: 'allocatedByUser'
      });
    }
  }
  
  Inquiry.init({
    id: {
      type: DataTypes.STRING(36),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true }
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^\d{10}$/
      }
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    inquiryType: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [
          [
            'Warehouse Availability Inquiry',
            'AI & Predictive Analytics Solutions',
            'Short-Term Storage & Leasing',
            'Full-Service Warehousing & Fulfillment'
          ]
        ]
      }
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    preferredContactMethod: {
      type: DataTypes.STRING,
      allowNull: true
    },
    preferredContactTime: {
      type: DataTypes.STRING,
      allowNull: true
    },
    attachmentUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    consent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'in_progress', 'completed', 'cancelled']]
      }
    },
    // Common fields across different inquiry types
    industryType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    industryOther: {
      type: DataTypes.STRING,
      allowNull: true
    },
    spaceType: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: [['', 'Cold Storage', 'Dry Storage', 'Hazardous Goods']]
      }
    },
    // Fields for Warehouse Availability Inquiry
    locationPreference: {
      type: DataTypes.STRING,
      allowNull: true
    },
    leaseDuration: {
      type: DataTypes.STRING,
      allowNull: true
    },
    preferredStartDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Fields for AI & Predictive Analytics Solutions
    currentSystem: {
      type: DataTypes.STRING,
      allowNull: true
    },
    wmsOther: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Fields for Short-Term Storage & Leasing
    startDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    flexibilityRequirements: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const raw = this.getDataValue('flexibilityRequirements');
        return raw ? JSON.parse(raw) : [];
      },
      set(val) {
        this.setDataValue('flexibilityRequirements', JSON.stringify(val || []));
      }
    },
    fulfillmentServices: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const raw = this.getDataValue('fulfillmentServices');
        return raw ? JSON.parse(raw) : [];
      },
      set(val) {
        this.setDataValue('fulfillmentServices', JSON.stringify(val || []));
      }
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    },
    allocation_status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'unallocated',
      validate: {
        isIn: [['unallocated', 'allocated', 'invalid']]
      }
    },
    allocated_to: {
      type: DataTypes.STRING(36),
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    allocated_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    allocated_by: {
      type: DataTypes.STRING(36),
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    invalidation_reason: {
      type: DataTypes.STRING,
      allowNull: true
    },
    inquiry_type_id: {
      type: DataTypes.STRING(36),
      allowNull: true,
      references: {
        model: 'inquiry_types',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Inquiry',
    tableName: 'inquiries',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['email']
      },
      {
        fields: ['phone_number']
      },
      {
        fields: ['inquiry_type']
      },
      {
        fields: ['status']
      },
      {
        fields: ['allocation_status']
      },
      {
        fields: ['allocated_to']
      }
    ]
  });

  return Inquiry;
};