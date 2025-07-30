// services/adminUserService.js
const User = require('../../models/User');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

class AdminUserService {
  // Get all admin users with pagination and filters
  async getAdminUsers(filters = {}) {
    const {
      page = 1,
      limit = 20,
      role = 'all'
    } = filters;

    const offset = (page - 1) * limit;
    const whereClause = {
      isAdmin: true
    };

    try {
      const result = await User.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ['password'] },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      return {
        success: true,
        data: result.rows,
        pagination: {
          total: result.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(result.count / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch admin users: ${error.message}`);
    }
  }

  // Create a new admin user
  async createAdminUser(adminData) {
    const {
      firstName,
      lastName,
      email,
      password,
      mobileNumber,
      country,
      state,
      city,
      role_id
    } = adminData;

    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { email },
            { mobileNumber }
          ]
        }
      });

      if (existingUser) {
        throw new Error('User with this email or mobile number already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create admin user
      const newAdmin = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        mobileNumber,
        country: country || null,
        state: state || null,
        city: city || null,
        role_id: role_id || null,
        isAdmin: true
      });

      // Return admin without password
      const adminResponse = {
        id: newAdmin.id,
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        email: newAdmin.email,
        mobileNumber: newAdmin.mobileNumber,
        country: newAdmin.country,
        state: newAdmin.state,
        city: newAdmin.city,
        role_id: newAdmin.role_id,
        isAdmin: newAdmin.isAdmin,
        createdAt: newAdmin.createdAt,
        updatedAt: newAdmin.updatedAt
      };

      return {
        success: true,
        data: adminResponse
      };
    } catch (error) {
      throw new Error(`Failed to create admin user: ${error.message}`);
    }
  }

  // Update an admin user
  async updateAdminUser(adminId, updateData) {
    const {
      firstName,
      lastName,
      email,
      mobileNumber,
      country,
      state,
      city
    } = updateData;

    try {
      // Find the admin user
      const admin = await User.findOne({
        where: {
          id: adminId,
          isAdmin: true
        }
      });

      if (!admin) {
        throw new Error('Admin user not found');
      }

      // Check if email/mobile is already taken by another user
      if (email !== admin.email || mobileNumber !== admin.mobileNumber) {
        const existingUser = await User.findOne({
          where: {
            [Op.and]: [
              { id: { [Op.ne]: adminId } },
              {
                [Op.or]: [
                  { email },
                  { mobileNumber }
                ]
              }
            ]
          }
        });

        if (existingUser) {
          throw new Error('Email or mobile number is already in use by another user');
        }
      }

      // Update admin user
      await admin.update({
        firstName,
        lastName,
        email,
        mobileNumber,
        country: country || null,
        state: state || null,
        city: city || null
      });

      // Return updated admin without password
      const adminResponse = {
        id: admin.id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        mobileNumber: admin.mobileNumber,
        country: admin.country,
        state: admin.state,
        city: admin.city,
        role_id: admin.role_id,
        isAdmin: admin.isAdmin,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
      };

      return {
        success: true,
        data: adminResponse
      };
    } catch (error) {
      throw new Error(`Failed to update admin user: ${error.message}`);
    }
  }

  // Delete an admin user
  async deleteAdminUser(adminId) {
    try {
      // Find the admin user
      const admin = await User.findOne({
        where: {
          id: adminId,
          isAdmin: true
        }
      });

      if (!admin) {
        throw new Error('Admin user not found');
      }

      // Check if this is the last admin
      const adminCount = await User.count({
        where: { isAdmin: true }
      });

      if (adminCount <= 1) {
        throw new Error('Cannot delete the last admin user');
      }

      // Delete the admin user
      await admin.destroy();

      return {
        success: true,
        message: 'Admin user deleted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to delete admin user: ${error.message}`);
    }
  }

  // Get admin user by ID
  async getAdminUserById(adminId) {
    try {
      const admin = await User.findOne({
        where: {
          id: adminId,
          isAdmin: true
        },
        attributes: { exclude: ['password'] }
      });

      if (!admin) {
        throw new Error('Admin user not found');
      }

      return {
        success: true,
        data: admin
      };
    } catch (error) {
      throw new Error(`Failed to fetch admin user: ${error.message}`);
    }
  }

  // Get admin statistics
  async getAdminStats() {
    try {
      const totalAdmins = await User.count({
        where: { isAdmin: true }
      });

      const recentAdmins = await User.count({
        where: {
          isAdmin: true,
          createdAt: {
            [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      });

      return {
        success: true,
        data: {
          totalAdmins,
          recentAdmins,
          activeAdmins: totalAdmins // All admin users are considered active
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch admin statistics: ${error.message}`);
    }
  }
}

module.exports = new AdminUserService();