const devTools = [
  {
    type: "header",
    text: {
      type: "plain_text",
      text: ":wrench:  Developer Tools",
    },
  },
  {
    type: "actions",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: ":recycle:  Sync Users",
          emoji: true,
        },
        value: "sync_users",
      },
    ],
  },
  {
    type: "divider",
  },
];

export default devTools;
