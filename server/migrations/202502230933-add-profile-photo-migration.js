'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'profilePhoto', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'default.jpg'
    });
  },

  down: async (queryInterface, Sequelize) => {
    
  }
};