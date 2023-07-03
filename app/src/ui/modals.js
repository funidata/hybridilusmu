const officeModifyModalView = {
  type: "modal",
  title: {
    type: "plain_text",
    text: "Toimiston muokkaus",
  },
  close: {
    type: "plain_text",
    text: "Eiku",
  },
  submit: {
    type: "plain_text",
    text: "Muokkaa",
  },
  callback_id: "modify_office",
};

const officeCreationModalView = {
  type: "modal",
  title: {
    type: "plain_text",
    text: "Toimiston lisäys",
  },
  close: {
    type: "plain_text",
    text: "Eiku",
  },
  submit: {
    type: "plain_text",
    text: "Luo",
  },
  callback_id: "submit_office",
};

const officeControlModalView = {
  type: "modal",
  title: {
    type: "plain_text",
    text: "Toimistojen hallinta",
  },
  close: {
    type: "plain_text",
    text: "Sulje",
  },
};

/**
 * Defines the default settings modal's title
 * and what text is displayed as tooltip on the closing 'X' button.
 * These are basic attributes of the modal view.
 */
const defaultSettingsModalView = {
  type: "modal",
  title: {
    type: "plain_text",
    text: "Oletusasetukset",
  },
  close: {
    type: "plain_text",
    text: "Sulje",
  },
};

module.exports = {
  officeControlModalView,
  officeCreationModalView,
  officeModifyModalView,
  defaultSettingsModalView,
};
