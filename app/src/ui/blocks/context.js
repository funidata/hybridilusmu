const context = (text) => ({
  type: "context",
  elements: [
    {
      type: "mrkdwn",
      text,
    },
  ],
});

module.exports = { context };
