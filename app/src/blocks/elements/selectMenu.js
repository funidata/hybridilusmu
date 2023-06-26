const selectMenu = (id) => {
  const selectMenuElement = {
    type: "section",
    block_id: id,
    text: {
      type: "mrkdwn",
      text: "Toimisto",
    },
    accessory: {
      action_id: "text1234",
      type: "static_select",
      placeholder: {
        type: "plain_text",
        text: "Select an item",
      },
      options: [
        {
          text: {
            type: "plain_text",
            text: "*this is plain_text text*",
          },
          value: "value-0",
        },
        {
          text: {
            type: "plain_text",
            text: "*this is plain_text text*",
          },
          value: "value-1",
        },
        {
          text: {
            type: "plain_text",
            text: "*this is plain_text text*",
          },
          value: "value-2",
        },
      ],
    },
  };

  return selectMenuElement;
};

module.exports = { selectMenu };
