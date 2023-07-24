const button = (text, callback, value, style, emoji = null, confirm = null) => {
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
    if (emoji?.registrationEmoji === "normal")
      buttonElement.text.text = `${
        emoji.officeEmoji ? emoji.officeEmoji : ""
      } ${text} :writing_hand: `;
    if (emoji?.registrationEmoji === "default")
      buttonElement.text.text = `${
        emoji.officeEmoji ? emoji.officeEmoji : ""
      } ${text} :robot_face: `;
  }
  if (confirm) {
    buttonElement.confirm = confirm;
  }
  return buttonElement;
};

module.exports = { button };
