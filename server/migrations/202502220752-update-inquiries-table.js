'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop existing table if it exists
    await queryInterface.dropTable('inquiries', { cascade: true });

    // Create new table with updated structure
    await queryInterface.createTable('inquiries', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      full_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      company_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      inquiry_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      preferred_contact_method: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      preferred_contact_time: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      attachment_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      consent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending',
      },
      industry_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      industry_other: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      space_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      location_preference: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lease_duration: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      preferred_start_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      current_system: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      wms_other: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      flexibility_requirements: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: [],
      },
      fulfillment_services: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: [],
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      }
    });

    // Add indexes
    await queryInterface.addIndex('inquiries', ['email']);
    await queryInterface.addIndex('inquiries', ['phone_number']);
    await queryInterface.addIndex('inquiries', ['inquiry_type']);
    await queryInterface.addIndex('inquiries', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('inquiries');
  }
};