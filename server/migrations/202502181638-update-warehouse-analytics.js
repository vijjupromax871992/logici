// server/migrations/[timestamp]-update-warehouse-analytics.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('warehouse_analytics', 'conversion_rate', {
      type: Sequelize.FLOAT,
      defaultValue: 0,
      allowNull: true
    });

    await queryInterface.addColumn('warehouse_analytics', 'bounce_rate', {
      type: Sequelize.FLOAT,
      defaultValue: 0,
      allowNull: true
    });

    await queryInterface.addColumn('warehouse_analytics', 'average_time_spent', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: true
    });

    // Add indexes
    await queryInterface.addIndex('warehouse_analytics', ['warehouse_id']);
    await queryInterface.addIndex('warehouse_analytics', ['date']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('warehouse_analytics', 'conversion_rate');
    await queryInterface.removeColumn('warehouse_analytics', 'bounce_rate');
    await queryInterface.removeColumn('warehouse_analytics', 'average_time_spent');
    
    await queryInterface.removeIndex('warehouse_analytics', ['warehouse_id']);
    await queryInterface.removeIndex('warehouse_analytics', ['date']);
  }
};