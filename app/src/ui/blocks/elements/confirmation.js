const confirmation = (text, confirmButtonText = "Kyllä", style) => {
  const confirmationElement = {
    title: {
      type: "plain_text",
      text: "Varmastikko?",
    },
    text: {
      type: "plain_text",
      text: text,
    },
    confirm: {
      type: "plain_text",
      text: confirmButtonText,
    },
    deny: {
      type: "plain_text",
      text: "Eiku",
    },
    style,
  };

  return confirmationElement;
};

module.exports = { confirmation };
