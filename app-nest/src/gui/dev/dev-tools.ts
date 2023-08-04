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
        },
        action_id: "sync_users",
      },
    ],
  },
  {
    type: "context",
    elements: [
      {
        type: "plain_text",
        text: "In development environment, users are not synchronized between local database and Slack on app start to avoid running into API rate limits due to hot-reloads. Sync users manually when necessary.",
      },
    ],
  },
  {
    type: "divider",
  },
];

export default devTools;
