/**
 * Creates an input element in Slack Block Kit format.
 * @param {string} label Label to be shown for the input field.
 * @param {string} callback Callback action_id string.
 * @param {string} initialValue Optional initial value for the input field
 * @returns Object describing the input element.
 */
const textInput = (label, callback, initialValue, hint) => {
  const textInputElement = {
    type: "input",
    block_id: callback,
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
  if (initialValue) textInputElement.element.initial_value = initialValue;
  if (hint) textInputElement.hint = { type: "plain_text", text: hint };
  return textInputElement;
};

module.exports = { textInput };
