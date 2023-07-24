"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const removeConstraints = async (foreignKeys, target) => {
      for (const foreignKey of foreignKeys) {
        const { tableName, constraintName } = foreignKey;
        if (constraintName.includes(target)) {
          await queryInterface.removeConstraint(tableName, constraintName);
        }
      }
    };

    // Clean up ScheduledMessage constraints to Jobs.
    const scheduledMessageForeignKeys = await queryInterface.getForeignKeyReferencesForTable(
      "ScheduledMessages",
    );
    await removeConstraints(scheduledMessageForeignKeys, "channelId");
    await queryInterface.changeColumn("ScheduledMessages", "channelId", {
      type: Sequelize.INTEGER,
      references: {
        model: "Jobs",
        key: "channel_id",
      },
      onDelete: "CASCADE",
    });

    // Clean up DefaultOffice constraints.
    const defaultOfficeForeignKeys = await queryInterface.getForeignKeyReferencesForTable("People");
    await removeConstraints(defaultOfficeForeignKeys, "DefaultOffice");
    await queryInterface.changeColumn("People", "DefaultOffice", {
      type: Sequelize.INTEGER,
      references: {
        model: "Offices",
        key: "id",
      },
      onDelete: "SET NULL",
    });
    // Clean up Signups constraints.
    const signupsForeignkeys = await queryInterface.getForeignKeyReferencesForTable("Signups");
    await removeConstraints(signupsForeignkeys, "OfficeId");
    await queryInterface.changeColumn("Signups", "OfficeId", {
      type: Sequelize.INTEGER,
      references: {
        model: "Offices",
        key: "id",
      },
      onDelete: "CASCADE",
    });

    // Clean up Defaultsignups constraints.
    const defaultsignupsForeignKeys = await queryInterface.getForeignKeyReferencesForTable(
      "Defaultsignups",
    );
    await removeConstraints(defaultsignupsForeignKeys, "OfficeId");
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
