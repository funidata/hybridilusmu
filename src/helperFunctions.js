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

/**
 * Turns Slack mentions in a string to plain text representations thereof.
 *
 * @param {function} userFormatter - User id formatter, like `(uid) => doThings(userCache, uid)`
 * @param {function} usergroupFormatter - Usergroup id formatter, like `(ugid) => doOtherThings(usergroups, ugid)`
 * @param {string} str - The string to replace the mentions in
 * @returns {string} String with mentions turned into plain text
 */
const replaceMentionsWithPlaintext = (userFormatter, usergroupFormatter, str) => {
    let ret = '';
    let inspect = str;
    let next = -1;
    const takeExpr = (skip = 0) => {
        const skipN = typeof skip === 'string' ? skip.length : skip;
        const endPos = inspect.indexOf('>');
        if (endPos < 0) {
            return false;
        }
        const expr = inspect.substr(skipN, endPos - skipN);
        inspect = inspect.substr(endPos + 1);
        const barPos = expr.indexOf('|');
        if (barPos >= 0) {
            return expr.substr(0, barPos);
        }
        return expr;
    };
    while (inspect.length > 0) {
        next = inspect.indexOf('<');
        if (next < 0) {
            next = inspect.length;
        }
        ret += inspect.substr(0, next);
        inspect = inspect.substr(next + 1);
        if (inspect.startsWith('@')) {
            // unroll user mention
            const uId = takeExpr('@');
            ret += userFormatter(uId);
        } else if (inspect.startsWith('!subteam^')) {
            // unroll usergroup mention
            const ugId = takeExpr('!subteam^');
            ret += usergroupFormatter(ugId);
        } else if (inspect.length > 0) {
            // this instance of '<' didn't match user or subteam
            ret += '<';
        }
    }
    return ret;
};

module.exports = {
    getMemberChannelIds,
    postEphemeralMessage,
    postMessage,
    readUsergroupsFromCleanSlate,
    replaceMentionsWithPlaintext,
};
