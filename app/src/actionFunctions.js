const home = require("./ui/home");
const service = require("./databaseService");
const { updateScheduledMessages } = require("./lateRegistration");

exports.enableActionFunctions = ({ app, userCache }) => {
  /**
   * Acknowledges the user's overflow menu selection and opens the
   * specified modal view.
   */
  app.action("overflow_menu", async ({ body, ack, client }) => {
    await ack();
    const selectedOption = body.actions[0].selected_option.value;
    if (selectedOption === "Toimistojen hallinta") {
      home.openOfficeControlView(client, body.user.id, body.trigger_id);
    } else if (selectedOption === "Lisää toimisto") {
      home.openOfficeCreationView(client, body.user.id, body.trigger_id);
    }
  });

  /**
   * Deletes the specified office and then updates the home and office
   * control views.
   */
  app.action("office_delete_click", async ({ body, ack, client }) => {
    await ack();
    const officeId = body.actions[0].value;
    await service.removeOffice(officeId);
    home.update(client, body.user.id, userCache);
    home.updateOfficeControlView(client, body.user.id);
  });

  /**
   * Opens the office modify modal for the specified office.
   */
  app.action("office_modify_click", async ({ body, ack, client }) => {
    await ack();
    const officeId = body.actions[0].value;
    home.openOfficeModifyView(client, body.user.id, officeId);
  });

  /**
   * Acknowledges the user's office selection, saving that office as their
   * default office and then updating the home and default settings views
   * with the selected office.
   */
  app.action("office_select", async ({ body, ack, client }) => {
    await ack();
    const user = body.user.id;
    const office = JSON.parse(body.actions[0].selected_option.value);
    await service.addDefaultOfficeForUser(user, office.id);
    home.update(client, user, userCache, office);
    home.updateDefaultSettingsView(client, user, office);
  });

  /**
   * Updates the Home tab for the specified user.
   */
  app.action("update_click", async ({ body, ack, client }) => {
    home.update(client, body.user.id, userCache);
    await ack();
  });

  /**
   * Opens a modal view for the default settings
   */
  app.action("settings_click", async ({ body, ack, client }) => {
    home.openDefaultSettingsView(client, body.user.id, body.trigger_id);
    await ack();
  });

  /**
   * Registers the user as present at the office for the selected day and updates the Home tab.
   */
  app.action("office_click", async ({ body, ack, client }) => {
    const data = JSON.parse(body.actions[0].value);
    await service.changeRegistration(body.user.id, data.officeId, data.date, !data.atOffice);
    await updateScheduledMessages(app, data.date);
    home.update(client, body.user.id, userCache);
    await ack();
  });

  /**
   * Registers the user as not present at the office for the selected day
   * and updates the Home tab.
   */
  app.action("remote_click", async ({ body, ack, client }) => {
    const data = JSON.parse(body.actions[0].value);
    await service.changeRegistration(body.user.id, data.officeId, data.date, !data.isRemote, false);
    await updateScheduledMessages(app, data.date);
    home.update(client, body.user.id, userCache);
    await ack();
  });

  /**
   * Registers the user as present at the office by default for the selected day
   * and updates the Home tab.
   */
  app.action("default_office_click", async ({ body, ack, client }) => {
    const data = JSON.parse(body.actions[0].value);
    await service.changeDefaultRegistration(
      body.user.id,
      data.officeId,
      data.weekday,
      !data.defaultAtOffice,
    );
    home.update(client, body.user.id, userCache);
    home.updateDefaultSettingsView(client, body.user.id);
    await ack();
  });

  /**
   * Registers the user as not present at the office by default for the selected day
   * and updates the Home tab.
   */
  app.action("default_remote_click", async ({ body, ack, client }) => {
    const data = JSON.parse(body.actions[0].value);
    await service.changeDefaultRegistration(
      body.user.id,
      data.officeId,
      data.weekday,
      !data.defaultIsRemote,
      false,
    );
    home.update(client, body.user.id, userCache);
    home.updateDefaultSettingsView(client, body.user.id);
    await ack();
  });
};
