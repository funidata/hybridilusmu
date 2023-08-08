import devTools from "../dev/dev-tools";

const getHomeTabBlocks = () => [
  ...devTools,
  {
    type: "header",
    text: {
      type: "plain_text",
      text: "Ilmoittautumiset",
    },
  },
  {
    type: "actions",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "Toimistolla",
        },
        style: "primary",
      },
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "Etänä",
        },
      },
      {
        action_id: "text1234",
        type: "static_select",
        placeholder: {
          type: "plain_text",
          text: "Valitse toimipiste",
        },
        initial_option: {
          text: {
            type: "plain_text",
            text: "Helsinki",
          },
          value: "hki",
        },
        options: [
          {
            text: {
              type: "plain_text",
              text: "Helsinki",
            },
            value: "hki",
          },
          {
            text: {
              type: "plain_text",
              text: "Tampere",
            },
            value: "tre",
          },
        ],
      },
      {
        type: "overflow",
        options: [
          {
            text: {
              type: "plain_text",
              text: "Poista ilmoittautuminen",
            },
            value: "value-0",
          },
        ],
        action_id: "overflow",
      },
    ],
  },
];

export default getHomeTabBlocks;
