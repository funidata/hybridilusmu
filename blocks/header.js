const header = (text) => (
  {
    type: 'header',
    text: {
      type: 'plain_text',
      text,
    },
  }
);

module.exports = { header };
