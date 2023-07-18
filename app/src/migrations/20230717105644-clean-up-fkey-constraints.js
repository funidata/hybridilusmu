"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Clean up ScheduledMessage constraints to Jobs.
    await queryInterface.removeConstraint("ScheduledMessages", "ScheduledMessages_channelId_fkey");
    await queryInterface.changeColumn("ScheduledMessages", "channelId", {
      type: Sequelize.INTEGER,
      references: {
        model: "Jobs",
        key: "channel_id",
      },
      onDelete: "CASCADE",
    });

    // Clean up DefaultOffice constraints.
    await queryInterface.removeConstraint("People", "People_DefaultOffice_fkey");
    await queryInterface.removeConstraint("People", "People_DefaultOffice_fkey1");
    await queryInterface.removeConstraint("People", "People_DefaultOffice_fkey2");
    await queryInterface.removeConstraint("People", "People_DefaultOffice_fkey3");
    await queryInterface.changeColumn("People", "DefaultOffice", {
      type: Sequelize.INTEGER,
      references: {
        model: "Offices",
        key: "id",
      },
      onDelete: "SET NULL",
    });
    // Clean up Signups constraints.
    await queryInterface.removeConstraint("Signups", "Signups_OfficeId_fkey");
    await queryInterface.removeConstraint("Signups", "Signups_OfficeId_fkey1");
    await queryInterface.removeConstraint("Signups", "Signups_OfficeId_fkey2");
    await queryInterface.removeConstraint("Signups", "Signups_OfficeId_fkey3");
    await queryInterface.changeColumn("Signups", "OfficeId", {
      type: Sequelize.INTEGER,
      references: {
        model: "Offices",
        key: "id",
      },
      onDelete: "CASCADE",
    });

    // Clean up Defaultsignups constraints.
    await queryInterface.removeConstraint("Defaultsignups", "Defaultsignups_OfficeId_fkey");
    await queryInterface.removeConstraint("Defaultsignups", "Defaultsignups_OfficeId_fkey1");
    await queryInterface.removeConstraint("Defaultsignups", "Defaultsignups_OfficeId_fkey2");
    await queryInterface.changeColumn("Defaultsignups", "OfficeId", {
      type: Sequelize.INTEGER,
      references: {
        model: "Offices",
        key: "id",
      },
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("Defaultsignups", "Defaultsignups_OfficeId_fkey");
    const addOldDefaultsignupsConstraint = async () => {
      await queryInterface.changeColumn("Defaultsignups", "OfficeId", {
        type: Sequelize.INTEGER,
        references: {
          model: "Offices",
          key: "id",
        },
      });
    };
    await addOldDefaultsignupsConstraint();
    await addOldDefaultsignupsConstraint();
    await addOldDefaultsignupsConstraint();

    await queryInterface.removeConstraint("Signups", "Signups_OfficeId_fkey");
    const addOldSignupsConstraint = async () => {
      await queryInterface.changeColumn("Signups", "OfficeId", {
        type: Sequelize.INTEGER,
        references: {
          model: "Offices",
          key: "id",
        },
      });
    };
    await addOldSignupsConstraint();
    await addOldSignupsConstraint();
    await addOldSignupsConstraint();
    await addOldSignupsConstraint();

    const addOldDefaultOfficeConstraint = async () => {
      await queryInterface.changeColumn("People", "DefaultOffice", {
        type: Sequelize.INTEGER,
        references: {
          model: "Offices",
          key: "id",
        },
      });
    };
    await queryInterface.removeConstraint("People", "People_DefaultOffice_fkey");
    await addOldDefaultOfficeConstraint();
    await addOldDefaultOfficeConstraint();
    await addOldDefaultOfficeConstraint();
    await addOldDefaultOfficeConstraint();

    await queryInterface.removeConstraint("ScheduledMessages", "ScheduledMessages_channelId_fkey");

    await queryInterface.changeColumn("ScheduledMessages", "channelId", {
      type: Sequelize.INTEGER,
      references: {
        model: "Jobs",
        key: "channel_id",
      },
    });
  },
};
