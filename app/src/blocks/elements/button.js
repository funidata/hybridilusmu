const button = (text, callback, value, style, registrationStatus = null) => {
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
    if (style === 'primary' || style === 'danger') {
        buttonElement.style = style;
        if (registrationStatus === 'normal') buttonElement.text.text = `${text} :writing_hand:`;
        if (registrationStatus === 'default') buttonElement.text.text = `${text} :robot_face:`;
    }
    return (buttonElement);
};

module.exports = { button };
