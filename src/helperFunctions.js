const { DateTime } = require('luxon');

const service = require('./databaseService');
const dfunc = require('./dateFunctions');

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

/**
 * Generates a listing message for a given date
 * @param {string} date An ISO-8601 date string. If null:
 *  - please provide data via fetchedRegistrations
 *  - we'll also use a "today" string for rendering
 * @param {string} slackUsergroupId A Slack usergroup id, if any.
 * @param {*} fetchedRegistrations A ready set of registration data for perfomance reasons
 * @return {string} A message ready to post
 */
const generateListMessage = async (
    { usergroups },
    date,
    slackUsergroupId = null,
    fetchedRegistrations = null,
) => {
    const usergroupFilter = !slackUsergroupId
        ? () => true
        : (uid) => usergroups.isUserInUsergroup(uid, slackUsergroupId);
    const registrations = fetchedRegistrations || (
        await service.getRegistrationsFor(date)
    ).filter(usergroupFilter);
    const specifier = !slackUsergroupId
        ? ''
        : ` tiimistä ${usergroups.generateMentionString(slackUsergroupId)}`;
    const predicate = registrations.length === 1 ? 'on' : 'ovat';
    const dateInResponse = date
        ? dfunc.atWeekday(DateTime.fromISO(date))
        : 'Tänään';
    let response = !slackUsergroupId
        ? `${dateInResponse} toimistolla ${predicate}:`
        : `${dateInResponse}${specifier} ${predicate} toimistolla:`;
    if (registrations.length === 0) {
        response = `Kukaan${specifier} ei ole toimistolla ${dateInResponse.toLowerCase()}`;
    }
    response += '\n';
    registrations.forEach((user) => {
        response += `<@${user}>\n`;
    });
    return response;
};

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
    generateListMessage,
    readUsergroupsFromCleanSlate,
};
