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
    action_id: "overflow",
  };
  return overflowElement;
};

module.exports = { overflow };
