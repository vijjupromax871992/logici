module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn('warehouses', 'owner_id', {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
              model: 'users', // Name of the table
              key: 'id',
          },
          onDelete: 'SET NULL',
      });
  },
  down: async (queryInterface) => {
      await queryInterface.removeColumn('warehouses', 'owner_id');
  },
};
