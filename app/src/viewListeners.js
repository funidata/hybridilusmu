const service = require("./databaseService");
const home = require("./home");

/**
 * These will handle inputs from modals
 */
exports.enableViewListeners = ({ app, userCache }) => {
  app.view("submit_office", async ({ ack, body, view, client }) => {
    await ack();
    const user = body.user.id;
    const officeName = view.state.values.input_block.office_input.value;
    const result = await service.addOffice(officeName);
    if (result) {
      console.log(`Created a new office: ${officeName}`);
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
    const newOfficeName = view.state.values.input_block.office_input.value;
    const result = await service.updateOffice(officeId, newOfficeName);
    if (result) {
      console.log(`${user} updated an office name to: ${newOfficeName}`);
      home.update(client, user, userCache);
      home.openOfficeControlView(client, user, body.trigger_id);
    } else {
      const msg = `There was an error updating the office with a new name`;
      home.error(client, user, msg);
    }
  });
};
