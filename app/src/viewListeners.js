const service = require("./databaseService");
const home = require("./ui/home");

/**
 * These will handle inputs from modals
 */
exports.enableViewListeners = ({ app, userCache }) => {
  app.view("submit_office", async ({ ack, body, view, client }) => {
    await ack();
    const user = body.user.id;
    const officeName = view.state.values.office_name_input.office_name_input.value;
    const officeEmoji = view.state.values.office_emoji_input.office_emoji_input.value;
    const result = await service.addOffice(officeName, officeEmoji);
    if (result) {
      home.update(client, user, userCache);
    } else {
      const msg = `There was an error creating office: ${officeName}`;
      home.error(client, user, msg);
    }
  });

  app.view("modify_office", async ({ ack, body, view, client }) => {
    await ack();
    const user = body.user.id;
    const officeId = view.private_metadata;
    const newOfficeName = view.state.values.office_name_input.office_name_input.value;
    const newOfficeEmoji = view.state.values.office_emoji_input.office_emoji_input.value;
    const result = await service.updateOffice(officeId, newOfficeName, newOfficeEmoji);
    if (result) {
      home.update(client, user, userCache);
      home.openOfficeControlView(client, user, body.trigger_id);
    } else {
      const msg = `There was an error updating the office with a new name`;
      home.error(client, user, msg);
    }
  });
};
