'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Votings', 'options', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: false,
      defaultValue: []
    });

    await queryInterface.addColumn('Votings', 'results', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {}
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Votings', 'options');
    await queryInterface.removeColumn('Votings', 'results');
  }
};