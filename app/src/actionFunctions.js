const home = require("./home");
const service = require("./databaseService");
const { updateScheduledMessages } = require("./lateRegistration");

exports.enableActionFunctions = ({ app }) => {
  app.action("office_select", async ({ body, ack, client }) => {
    const office = body.actions[0].selected_option.value;
    home.update(client, body.user.id, office);
    await ack();
  });

  /**
   * Updates the Home tab for the specified user.
   */
  app.action("update_click", async ({ body, ack, client }) => {
    home.update(client, body.user.id);
    await ack();
  });

  /**
   * Opens a modal view for the default settings
   */
  app.action("settings_click", async ({ body, ack, client }) => {
    home.openView(client, body.user.id, body.trigger_id);
    await ack();
  });

  /**
   * Registers the user as present at the office for the selected day and updates the Home tab.
   */
  app.action("office_click", async ({ body, ack, client }) => {
    const data = JSON.parse(body.actions[0].value);
    await service.changeRegistration(body.user.id, data.date, !data.atOffice);
    await updateScheduledMessages(app, data.date);
    home.update(client, body.user.id);
    await ack();
  });

  /**
   * Registers the user as not present at the office for the selected day
   * and updates the Home tab.
   */
  app.action("remote_click", async ({ body, ack, client }) => {
    const data = JSON.parse(body.actions[0].value);
    await service.changeRegistration(body.user.id, data.date, !data.isRemote, false);
    await updateScheduledMessages(app, data.date);
    home.update(client, body.user.id);
    await ack();
  });

  /**
   * Registers the user as present at the office by default for the selected day
   * and updates the Home tab.
   */
  app.action("default_office_click", async ({ body, ack, client }) => {
    const data = JSON.parse(body.actions[0].value);
    await service.changeDefaultRegistration(body.user.id, data.weekday, !data.defaultAtOffice);
    home.update(client, body.user.id);
    home.updateView(client, body.user.id);
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
      data.weekday,
      !data.defaultIsRemote,
      false,
    );
    home.update(client, body.user.id);
    home.updateView(client, body.user.id);
    await ack();
  });
};
