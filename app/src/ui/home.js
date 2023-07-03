const service = require("../databaseService");
const { mrkdwn } = require("./blocks/section");
const {
  officeControlModalView,
  officeCreationModalView,
  officeModifyModalView,
  defaultSettingsModalView,
} = require("./modals");

const {
  getUpdateBlock,
  getRegistrationsBlock,
  getDefaultSettingsBlock,
  getOfficeCreationBlock,
  getOfficeControlBlock,
  getOfficeModifyBlock,
  getNoOfficesBlock,
} = require("./customBlocks");

const modals = new Map();

/**
 * Updates the Home tab.
 */
const update = async (client, userId, userCache, selectedOffice) => {
  let blocks = [];
  const isAdmin = (await userCache.getCachedUser(userId)).is_admin;
  const offices = await service.getAllOffices();
  if (!selectedOffice) {
    selectedOffice = await service.getDefaultOfficeForUser(userId);
  }
  blocks = blocks.concat(await getUpdateBlock(selectedOffice, offices, isAdmin));
  if (offices.length === 0) {
    console.log("no offices found, push new view");
    blocks = blocks.concat(await getNoOfficesBlock());
  } else {
    blocks = blocks.concat(await getRegistrationsBlock(userId, selectedOffice));
  }
  client.views.publish({
    user_id: userId,
    view: {
      type: "home",
      blocks,
    },
  });
};

/**
 * Opens the office modifying modal view.
 * @param {*} client Bolt client object.
 * @param {string} userId Slack user id.
 * @param {string} officeId ID of the office we're modifying.
 */
const openOfficeModifyView = async (client, userId, officeId) => {
  const block = await getOfficeModifyBlock(officeId);
  await client.views.update({
    view_id: modals.get(userId),
    view: { ...officeModifyModalView, blocks: block, private_metadata: officeId },
  });
};

/**
 * Opens the office creation modal view.
 */
const openOfficeCreationView = async (client, userId, triggerId) => {
  const block = await getOfficeCreationBlock();
  const res = await client.views.open({
    trigger_id: triggerId,
    view: { ...officeCreationModalView, blocks: block },
  });
  modals.set(userId, res.view.id);
};

const updateOfficeControlView = async (client, userId) => {
  const block = await getOfficeControlBlock();
  await client.views.update({
    view_id: modals.get(userId),
    view: { ...officeControlModalView, blocks: block },
  });
};

const openOfficeControlView = async (client, userId, triggerId) => {
  const block = await getOfficeControlBlock();
  const res = await client.views.open({
    trigger_id: triggerId,
    view: { ...officeControlModalView, blocks: block },
  });
  modals.set(userId, res.view.id);
};

/**
 * Opens a modal view.
 */
const openDefaultSettingsView = async (client, userId, triggerId) => {
  const block = await getDefaultSettingsBlock(userId);
  const res = await client.views.open({
    trigger_id: triggerId,
    view: { ...defaultSettingsModalView, blocks: block },
  });

  modals.set(userId, res.view.id);
};

/**
 * Updates a modal view.
 */
const updateDefaultSettingsView = async (client, userId) => {
  const block = await getDefaultSettingsBlock(userId);
  await client.views.update({
    view_id: modals.get(userId),
    view: { ...defaultSettingsModalView, blocks: block },
  });
};

/**
 * Displays an error page on the Home tab.
 */
const error = async (client, userId, message) => {
  client.views.publish({
    user_id: userId,
    view: {
      type: "home",
      blocks: [mrkdwn(message)],
    },
  });
};

module.exports = {
  error,
  openDefaultSettingsView,
  update,
  updateDefaultSettingsView,
  openOfficeCreationView,
  openOfficeControlView,
  updateOfficeControlView,
  openOfficeModifyView,
};
