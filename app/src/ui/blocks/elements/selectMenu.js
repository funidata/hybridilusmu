const selectMenu = (offices, initialOffice, callback) => {
  const options = offices.map((office) => ({
    text: {
      type: "plain_text",
      text: office,
    },
    value: office,
  }));
  const initialOption = options.find(({ value }) => value === initialOffice);

  const selectMenuElement = {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "Toimisto",
    },
    accessory: {
      action_id: callback,
      type: "static_select",
      placeholder: {
        type: "plain_text",
        text: "Toimisto",
      },
      options: options,
      initial_option: initialOption,
    },
  };

  return selectMenuElement;
};

module.exports = { selectMenu };
