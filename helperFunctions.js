
/**
 * Our user API object cache. Format is the following:
 * {
 *   <userId>: {
 *     user: {
 *       id: <userId>,
 *       real_name: "Matti Meikäläinen",
 *       is_restricted: false
 *     },
 *     date: <timestamp in milliseconds>
 *   },
 *   <userId>: { ... },
 *   ...
 * }
 */
const usercache = {};

/**
 * Try to cache our user data so that getUserRestriction() doesn't bump into rate limits
 * @param {*} userId
 * @returns {Object} The user object as originally returned by Slack
 */
async function getCachedUser(app, userId) {
    if (usercache[userId] && usercache[userId].date + 60000 > new Date().getTime()) {
        console.log(`cache hit for user ${userId}`);
        return usercache[userId].user;
    }
    const user = await app.client.users.info({ user: userId });
    // something went wrong
    if (!user.ok) {
        console.log(`users.info failed for uid ${userId}`);
        return null;
    }
    // success
    console.log(`caching user ${userId}`);
    usercache[userId] = {
        user: user.user,
        date: new Date().getTime(),
    };
    return user.user;
}

/**
 * Get the restriction/guest value of the given user from Slack API.
 * @param {*} userId
 * @returns True if the user is restricted.
 */
async function getUserRestriction(app, userId) {
    const user = await getCachedUser(app, userId);
    // if we don't have a successful api call, default to restriction
    if (!user || user.is_restricted === undefined) {
        return true;
    }
    return user.is_restricted;
}

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
    getCachedUser,
    getMemberChannelIds, 
    getUserRestriction,
    postEphemeralMessage, 
    postMessage
};
