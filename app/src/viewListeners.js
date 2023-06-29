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
      home.update(client, user, userCache);
    } else {
      const msg = `There was an error creating office: ${officeName}`;
      home.error(client, user, msg);
    }
  });
};
