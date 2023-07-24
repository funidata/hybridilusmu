const defaultSettingButton = (text, callback, value, style, emoji, confirm) => {
  const buttonElement = {
    type: "button",
    text: {
      type: "plain_text",
      emoji: true,
      text,
    },
    value,
    action_id: callback,
  };
  if (style === "primary" || style === "danger") {
    buttonElement.style = style;
    if (emoji) buttonElement.text.text = `${emoji} ${text}`;
  }
  if (confirm) {
    buttonElement.confirm = confirm;
  }
  return buttonElement;
};

module.exports = { defaultSettingButton };
