/**
* Returns a list of all the channels the bot is a member of.
*/
async function getMemberChannelIds(app) {
    return (await app.client.conversations.list({ types: 'public_channel,private_channel' })).channels
        .filter((c) => c.is_member)
        .map((c) => c.id);
}

/**
 * Returns whether we're a channel member or not
 * @param {*} app - Slack app instance
 * @param {*} channelId - Slack channel id
 * @returns {Promise.<boolean>} Whether we're a member of the channel or not
 */
const isBotChannelMember = async (app, channelId) => {
    try {
        return (await app.client.conversations.info({ channel: channelId })).channel.is_member === true;
    } catch (err) {
        if (err.data && err.data.error === 'channel_not_found') {
            // private channels we're not a member of don't turn up data,
            // so just be silent in such cases
            return false;
        }
        console.log('failed to get channel membership status', err);
    }
    return false;
};

/**
* Posts an ephemeral message to the given user at the given channel.
*/
async function postEphemeralMessage(app, channelId, userId, message) {
    // Tarkistetaan, onko sovellus kutsuttu kanavalle tai onko kyseessä yksityisviesti
    const conversation = await app.client.conversations.info({ channel: channelId });
    if (conversation.channel.is_member || conversation.channel.is_im) {
        return app.client.chat.postEphemeral({
            channel: channelId,
            user: userId,
            text: message,
        });
    }
    return app.client.chat.postEphemeral({
        channel: userId,
        user: userId,
        text: message,
    });
}

/**
* Posts a message to the given channel.
*/
async function postMessage(app, channelId, message) {
    return app.client.chat.postMessage({
        channel: channelId,
        text: message,
    });
}

/**
 * Edits a given message on a given channel
 * @param {*} app - Slack app instance
 * @param {string} channelId - Slack channel id
 * @param {string} timestamp - Slack message id
 * @param {string} message - Your message
 * @returns {Object} - Slack message object
 */
async function editMessage(app, channelId, timestamp, message) {
    try {
        const result = await app.client.chat.update({
            channel: channelId,
            ts: timestamp,
            text: message
        })
        console.log(`edited message ${timestamp} in channel ${channelId} successfully`)
        return result
    } catch (err) {
        console.log('error while editing message ', err)
    }
}

/**
 * Reads usergroups from Slack to our local cache
 */
const readUsergroupsFromCleanSlate = async ({ app, usergroups }) => {
    const ugs = await app.client.usergroups.list();
    if (!ugs.ok) {
        console.log('Failed fetching usergroups');
        return;
    }
    if (!ugs.usergroups || !ugs.usergroups.length) {
        console.log('No usergroups found');
        return;
    }
    const usersOkay = usergroups.insertUsergroupsFromAPIListResponse(ugs);
    if (!usersOkay) {
        ugs.usergroups.forEach(async (ug) => {
            if (!ug.user_count || !usergroups.isDirty(ug.id)) {
                return;
            }
            const users = await app.client.usergroups.users.list({ usergroup: ug.id });
            const res = usergroups.insertUsergroupUsersFromAPIListResponse(users, ug.id);
            if (!res) {
                console.log(`Something went awry when trying to insert usergroup users for usergroup ${ug.id}`);
            }
        });
    }
};

/**
 * Formats a list of user IDs by fetching the user's full names
 * and sorting them alphabetically (case-insensitive)
 *
 * @param {List} userIdList - List of user ID strings
 * @param {function} userFormatter - user ID formatter,
 * fetches the user's name from the ID
 * @returns {List} List of users (string) in format: [ 'Ada Lovelace (<@ID>)', ... ]
 */
const formatUserIdList = (userIdList, userFormatter) => {
    return userIdList.map((user) => (
        userFormatter(user)
    )).sort(Intl.Collator().compare)
}

module.exports = {
    getMemberChannelIds,
    isBotChannelMember,
    postEphemeralMessage,
    postMessage,
    editMessage,
    readUsergroupsFromCleanSlate,
    formatUserIdList
};
