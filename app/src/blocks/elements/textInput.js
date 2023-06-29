const textInput = (label, callback) => {
  const textInputElement = {
    type: "input",
    block_id: "input_block",
    label: {
      type: "plain_text",
      text: label,
    },
    element: {
      type: "plain_text_input",
      action_id: callback,
      placeholder: {
        type: "plain_text",
        text: "Syötä tekstiä",
      },
      min_length: 2,
      max_length: 30,
    },
  };
  return textInputElement;
};

module.exports = { textInput };
