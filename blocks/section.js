const plain_text = (text) => (
  {
    type: 'section',
    text: {
      type: 'plain_text',
      text,
    },
  }
);

const mrkdwn = (text) => (
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text,
    },
  }
);

module.exports = { plain_text, mrkdwn };
