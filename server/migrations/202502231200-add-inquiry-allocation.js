// migrations/202502231200-add-inquiry-allocation.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('inquiries', 'allocation_status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'unallocated'
    });

    await queryInterface.addColumn('inquiries', 'allocated_to', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('inquiries', 'allocated_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('inquiries', 'allocated_by', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('inquiries', 'invalidation_reason', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addIndex('inquiries', ['allocation_status']);
    await queryInterface.addIndex('inquiries', ['allocated_to']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('inquiries', 'allocation_status');
    await queryInterface.removeColumn('inquiries', 'allocated_to');
    await queryInterface.removeColumn('inquiries', 'allocated_at');
    await queryInterface.removeColumn('inquiries', 'allocated_by');
    await queryInterface.removeColumn('inquiries', 'invalidation_reason');
  }
};