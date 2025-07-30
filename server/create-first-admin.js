// create-first-admin.js
// Run this script to create your first admin user
require('dotenv').config();
const bcrypt = require('bcrypt');
const { User } = require('./models');
const sequelize = require('./config/database');

async function createFirstAdmin() {
  try {
    await sequelize.authenticate();

    // Admin details - CHANGE THESE VALUES
    const adminData = {
      firstName: 'Super',
      lastName: 'Admin',
      email: 'vijay871992.logic.i@gmail.com',    
      password: 'admin123',              
      mobileNumber: '9967990037',        
      country: 'India',
      state: 'Maharashtra',
      city: 'Mumbai'
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      where: { email: adminData.email } 
    });

    if (existingAdmin) {
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Create admin user
    const admin = await User.create({
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      email: adminData.email,
      password: hashedPassword,
      mobileNumber: adminData.mobileNumber,
      country: adminData.country,
      state: adminData.state,
      city: adminData.city,
      isAdmin: true
    });


    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

// Run the function
createFirstAdmin();