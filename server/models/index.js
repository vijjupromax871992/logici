// /backend/models/index.js (UPDATED)
const sequelize = require('../config/database'); 
const { DataTypes } = require('sequelize');

// Import all models
const Role = require('./Role'); 
const Permission = require('./Permission'); 
const RolePermission = require('./RolePermission'); 
const User = require('./User'); 
const InquiryType = require('./inquirytype')(sequelize, DataTypes); 
const Warehouse = require('./warehouse')(sequelize, DataTypes);
const WarehouseApproval = require('./WarehouseApproval')(sequelize, DataTypes);
const WarehouseAnalytics = require('./WarehouseAnalytics')(sequelize, DataTypes);
const ActivityLog = require('./ActivityLog')(sequelize, DataTypes);
const Booking = require('./booking')(sequelize, DataTypes);
const Inquiry = require('./inquiries')(sequelize, DataTypes);
const OTP = require('./Otp');
const RegisterOTP = require('./RegisterOtp');

// Import new payment models
const Payment = require('./payment')(sequelize, DataTypes);
const ConfirmedBooking = require('./confirmedBooking')(sequelize, DataTypes);
const Contact = require('./Contact');

// Initialize associations
Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'roleId' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permissionId' });

User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });

Role.hasMany(InquiryType, { foreignKey: 'roleId' }); 
InquiryType.belongsTo(Role, { foreignKey: 'roleId' });

Warehouse.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' }); 
User.hasMany(Warehouse, { foreignKey: 'owner_id', as: 'warehouses' });

Warehouse.hasOne(WarehouseApproval, { foreignKey: 'warehouse_id', as: 'approval' });
WarehouseApproval.belongsTo(Warehouse, { foreignKey: 'warehouse_id', as: 'warehouse' });
WarehouseApproval.belongsTo(User, { foreignKey: 'admin_id', as: 'admin' });

Warehouse.hasMany(WarehouseAnalytics, { foreignKey: 'warehouse_id', as: 'analytics' });
WarehouseAnalytics.belongsTo(Warehouse, { foreignKey: 'warehouse_id', as: 'warehouse' });

Booking.belongsTo(Warehouse, { foreignKey: 'warehouse_id', as: 'warehouse' }); 
Warehouse.hasMany(Booking, { foreignKey: 'warehouse_id', as: 'bookings' });

// Payment associations
Payment.belongsTo(Warehouse, { foreignKey: 'warehouse_id', as: 'warehouse' });
Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Warehouse.hasMany(Payment, { foreignKey: 'warehouse_id', as: 'payments' });
User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments' });

// Confirmed Booking associations  
ConfirmedBooking.belongsTo(Warehouse, { foreignKey: 'warehouse_id', as: 'warehouse' });
ConfirmedBooking.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });
ConfirmedBooking.belongsTo(Payment, { foreignKey: 'payment_id', as: 'payment' });
ConfirmedBooking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Warehouse.hasMany(ConfirmedBooking, { foreignKey: 'warehouse_id', as: 'confirmedBookings' });
User.hasMany(ConfirmedBooking, { foreignKey: 'owner_id', as: 'ownedBookings' });
User.hasMany(ConfirmedBooking, { foreignKey: 'user_id', as: 'userBookings' });
Payment.hasOne(ConfirmedBooking, { foreignKey: 'payment_id', as: 'confirmedBooking' });

// Inquiry associations
InquiryType.hasMany(Inquiry, { foreignKey: 'typeId', as: 'inquiries' });
Inquiry.belongsTo(InquiryType, { foreignKey: 'typeId', as: 'type' });
Inquiry.belongsTo(User, { foreignKey: 'allocated_to', as: 'allocatedBusinessPartner'});
Inquiry.belongsTo(User, {foreignKey: 'allocated_by', as: 'allocatedByAdmin'});

// OTP associations
User.hasMany(OTP, {foreignKey: 'user_id', as: 'otps'});
OTP.belongsTo(User, {foreignKey: 'user_id', as: 'user'});

User.hasMany(RegisterOTP, {foreignKey: 'user_id', as: 'registrationOtps'});
RegisterOTP.belongsTo(User, {foreignKey: 'user_id', as: 'user'});

// Activity Log associations
ActivityLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(ActivityLog, { foreignKey: 'user_id', as: 'activityLogs' });

// Contact associations (without database foreign key constraint)
Contact.belongsTo(User, { 
  foreignKey: 'contactedBy', 
  as: 'contactedByUser', 
  constraints: false,  // No foreign key constraint in database
  required: false 
});
User.hasMany(Contact, { 
  foreignKey: 'contactedBy', 
  as: 'contactsHandled',
  constraints: false   // No foreign key constraint in database
});

module.exports = {
  sequelize,
  Role,
  Permission,
  RolePermission,
  User,
  InquiryType,
  Warehouse,
  WarehouseApproval,
  WarehouseAnalytics,
  ActivityLog,
  Booking,
  Inquiry,
  OTP,
  RegisterOTP,
  Payment,
  ConfirmedBooking,
  Contact
};