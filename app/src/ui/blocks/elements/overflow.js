const overflow = (options) => {
  const optionObjects = options.map((option) => ({
    text: {
      type: "plain_text",
      text: option,
    },
    value: option,
  }));

  const overflowElement = {
    type: "overflow",
    options: optionObjects,
    action_id: "overflow_menu",
  };
  return overflowElement;
};

module.exports = { overflow };
