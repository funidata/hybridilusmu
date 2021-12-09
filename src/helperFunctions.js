/**
* Returns a list of all the channels the bot is a member of.
*/
async function getMemberChannelIds(app) {
    return (await app.client.conversations.list()).channels
        .filter((c) => c.is_member)
        .map((c) => c.id);
}

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
    } else {
        await app.client.chat.postEphemeral({
            channel: userId,
            user: userId,
            text: message,
        });
    }
    return false;
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

module.exports = {
    getMemberChannelIds,
    postEphemeralMessage,
    postMessage,
    readUsergroupsFromCleanSlate,
};
