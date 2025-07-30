'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('warehouses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      mobile_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      ownership_type: {
        type: Sequelize.ENUM('Broker', 'Owner'),
        allowNull: false,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      state: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      pin_code: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      warehouse_type: {
        type: Sequelize.ENUM(
          'Standard or General Storage',
          'Hazardous Chemicals Storage',
          'Climate Controlled Storage'
        ),
        allowNull: false,
      },
      build_up_area: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      total_plot_area: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      total_parking_area: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      plot_status: {
        type: Sequelize.ENUM('Agricultural', 'Commercial', 'Industrial', 'Residential'),
        allowNull: true,
      },
      listing_for: {
        type: Sequelize.ENUM('Rent', 'Sale'),
        allowNull: true,
      },
      plinth_height: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      dock_doors: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      electricity_kva: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      additional_details: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      rent: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      deposit: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      comments: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      images: {
        type: Sequelize.TEXT, // Store paths as a comma-separated string
        allowNull: true,
        validate: {
            maxLength(value) {
                if (value) {
                    const imageArray = value.split(',');
                    if (imageArray.length > 5) {
                        throw new Error('A maximum of 5 images is allowed.');
                    }
                }
            },
        },
    },    
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
      owner_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      floor_plans: {
        type: Sequelize.ENUM('Ground Floor', 'First Floor', 'Second Floor'),
        allowNull: true,
      },
      PRIMARYKEY: ['id'],
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('warehouses');
  },
};
