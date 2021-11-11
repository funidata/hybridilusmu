const button = (text, callback, value, style) => {
    const buttonElement = {
        type: 'button',
        text: {
            type: 'plain_text',
            emoji: true,
            text,
        },
        value,
        action_id: callback,
    };
    if (style === 'primary' || style === 'danger') { buttonElement.style = style; }
    return (buttonElement);
};

module.exports = { button };
