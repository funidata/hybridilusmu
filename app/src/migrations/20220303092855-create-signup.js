'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Signups', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      officeDate: {
        allowNull: false,
        type: Sequelize.DATEONLY
      },
      atOffice: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addColumn(
      'Signups', // name of Source model
      'PersonId', // name of the key we're adding
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'People', // name of Target model
          key: 'id', // key in Target model that we're referencing
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }
    );
    await queryInterface.addIndex('Signups', {
        fields: ['officeDate']
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Signups');
  }
};