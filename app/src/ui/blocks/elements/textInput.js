/**
 * Creates an input element in Slack Block Kit format.
 * @param {string} label Label to be shown for the input field.
 * @param {string} callback Callback action_id string.
 * @param {string} initialValue Optional initial value for the input field
 * @returns Object describing the input element.
 */
const textInput = (label, callback, initialValue) => {
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
      initial_value: initialValue,
      min_length: 2,
      max_length: 30,
    },
  };
  return textInputElement;
};

module.exports = { textInput };
