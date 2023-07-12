const selectMenu = (label, offices, initialOffice, callback, formatter) => {
  const options = offices.map((office) => {
    const value = JSON.stringify(office, ["id", "officeName"]);
    return {
      text: {
        type: "plain_text",
        text: formatter(office),
      },
      value: value,
    };
  });
  const initialOption = options.find(({ text }) => text.text === formatter(initialOffice));

  const selectMenuElement = {
    type: "section",
    text: {
      type: "mrkdwn",
      text: label,
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
