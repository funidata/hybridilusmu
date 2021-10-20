const button = (text, callback, value, style) => {
  const button = {
    type: "button",
      text: {
        type: "plain_text",
        emoji: true,
        text: text
      },
      value: value,
      action_id: callback
  }
  if (style === 'primary' || style === 'danger') { button.style = style }
  return (button)
}

module.exports = { button }
