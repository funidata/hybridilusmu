/**
* Returns a list of all the channels the bot is a member of.
*/
async function getMemberChannelIds(app) {
    return (await app.client.conversations.list()).channels
        .filter((c) => c.is_member)
        .map((c) => c.id);
}

/**
* Posts an ephemeral message to tschedulerhe given user at the given channel.
*/
async function postEphemeralMessage(app, channelId, userId, message) {
    // Tarkistetaan, onko sovellus kutsuttu kanavalle tai onko kyseessä yksityisviesti
    const conversation = await app.client.conversations.info({ channel: channelId });
    if (conversation.channel.is_member || conversation.channel.is_im) {
        await app.client.chat.postEphemeral({
            channel: channelId,
            user: userId,
            text: message,
        });
    }
}

/**
* Posts a message to the given channel.
*/
async function postMessage(app, channelId, message) {
    await app.client.chat.postMessage({
        channel: channelId,
        text: message,
    });
}

module.exports = {
    getMemberChannelIds,
    postEphemeralMessage,
    postMessage,
};
