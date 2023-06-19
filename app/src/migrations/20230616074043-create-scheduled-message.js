'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ScheduledMessages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      messageId: {
        type: Sequelize.STRING
      },
      date: {
        type: Sequelize.DATEONLY
      },
      channelId: {
        type: Sequelize.STRING,
        references: {
          model: 'Jobs',
          key: 'channel_id',
          as: 'channelId'
        }
      },
      usergroupId: {
        type: Sequelize.STRING
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ScheduledMessages');
  }
};