/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */

/**
 * This is an implementation of usergroup functionality.
 * These are usually known as subteams in Slack API terminology.
 */

/**
 * An object containing the usergroups, keyed by id.
 * Format is roughly the following:
 *   {
 *     "SFFFFFF": {
 *       // a bunch of fields that slack returns
 *       // this list is non-exhaustive
 *       id: "SFFFFFF",
 *       is_usergroup: true,
 *       name: "Kahvinkittaajat"
 *       handle: "kahvi",
 *       date_create: 1234567890,
 *       date_update: 1500000000,
 *       date_delete: 0, // if a usergroup is 'disabled', this field is non-zero
 *       users: [
 *         "UFFFFFF",
 *         "U111111"
 *       ],
 *       user_count: 2
 *     }
 *   }
 */
let usergroups = {};

/**
  * A lookup table of users.
  * Format is roughly the following:
  *   {
  *     // user is in two usergroups
  *     "UFFFFFF": {"SFFFFFF": true, "S000000": true},
  *     // user is in one usergroup
  *     "U111111": {"SFFFFFF": true}
  *   }
 */
let usersLookup = {};

/**
  * A lookup table of channels.
  * Format is roughly the following:
  *   {
  *     // channel is set as a default for two usergroups
  *     "CFFFFFF": {"SFFFFFF": true, "S000000": true},
  *     // channel is set as a default for one usergroup
  *     "C111111": {"SFFFFFF": true}
  *   }
 */
let channelsLookup = {};

/** Leading part of mention string */
const mentionLead = '<!subteam^';
/** Ending part of mention string */
const mentionTail = '>';

/**
 * Generates a mention string for the given usergroup.
 * @param {String} slack_usergroup_id The Slack id of the usergroup in question
 * @returns {String} A string that Slack will turn into a mention
 */
const generateMentionString = (slack_usergroup_id) => {
    const label = !usergroups[slack_usergroup_id]
        ? ''
        : `|@${usergroups[slack_usergroup_id].handle}`;
    return `<!subteam^${slack_usergroup_id}${label}>`;
};

/**
 * Reads a usergroup id from a mention string.
 * @param {String} str String to extract usergroup id from
 * @returns {String} A Slack usergroup id
 */
const parseMentionString = (str) => {
    // a mention string looks roughly like <!subteam^SXYZZY>
    if (str.startsWith(mentionLead)) {
        let inspect = str.substr(mentionLead.length);
        const tail_at = inspect.indexOf(mentionTail);
        if (tail_at > 0) {
            inspect = inspect.substr(0, tail_at);
            // there might also be a label in the mention string, which
            // would look a little something like this: <!subteam^SXYZZY|@xyzzy>
            const label_at = inspect.indexOf('|');
            if (label_at > 0) {
                return inspect.substr(0, label_at);
            }
            return inspect;
        }
    }
    return false;
};

/**
 * Generates a plaintext string describing a usergroup.
 * @param {String} slack_usergroup_id The Slack id of the usergroup in question
 * @returns {String} A plain text representation of the usergroup's identity, like
 *                   "Kahvinkittaajat (@kahvi)"
 */
const generatePlaintextString = (slack_usergroup_id) => {
    const ug = usergroups[slack_usergroup_id];
    if (!ug) {
        return '';
    }
    return `${ug.name} (@${ug.handle})`;
};

/**
 * You probably shouldn't be calling this from outside of the library
 */
const _clearData = () => {
    usergroups = {};
    usersLookup = {};
    channelsLookup = {};
};

const _dumpState = () => ({
    usergroups,
    usersLookup,
    channelsLookup,
});

const initSlackUser = (slack_user_id) => {
    if (!usersLookup[slack_user_id]) {
        usersLookup[slack_user_id] = {};
    }
};

const dropSlackUserFromUsergroup = (slack_user_id, slack_usergroup_id) => {
    const ug = usergroups[slack_usergroup_id];
    if (!ug) { return; }
    delete ug.users_lkup[slack_user_id];
    ug.users.filter((u) => u !== slack_user_id);
    ug.user_count = ug.users.length;
    if (usersLookup[slack_user_id]) {
        delete usersLookup[slack_user_id][slack_usergroup_id];
        if (Object.keys(usersLookup[slack_user_id]).length === 0) {
            delete usersLookup[slack_user_id];
        }
    }
};

const dropSlackUser = (slack_user_id) => {
    if (usersLookup[slack_user_id]) {
        const groups = Object.keys(usersLookup[slack_user_id]);
        for (let i = 0; i < groups.length; i += 1) {
            dropSlackUserFromUsergroup(slack_user_id, groups[i]);
        }
    }
    delete usersLookup[slack_user_id];
};

const initSlackUsergroup = (slack_usergroup_id) => {
    if (!usergroups[slack_usergroup_id]) {
        usergroups[slack_usergroup_id] = {
            id: `${slack_usergroup_id}`,
        };
    }
    if (!usergroups[slack_usergroup_id].users_lkup) {
        usergroups[slack_usergroup_id].users_lkup = {};
    }
    if (!usergroups[slack_usergroup_id].channels_lkup) {
        usergroups[slack_usergroup_id].channels_lkup = {};
    }
};

/**
 * This really shouldn't be needed
 * @param {Object} usergroup The usergroup object to edit
 * @returns {void}
 */
const normaliseUsergroup = (usergroup) => {
    if (!usergroup) {
        return usergroup;
    }
    const ret = { ...usergroup };
    if (typeof usergroup.user_count === 'string') {
        ret.user_count *= 1;
    }
    if (typeof usergroup.channel_count === 'string') {
        ret.channel_count *= 1;
    }
    return ret;
};

const dropSlackUsergroup = (slack_usergroup_id) => {
    Object.keys(usersLookup).forEach((slack_user_id) => {
        delete usersLookup[slack_user_id][slack_usergroup_id];
        if (Object.keys(usersLookup[slack_user_id]).length === 0) {
            dropSlackUser(slack_user_id);
        }
    });
    Object.keys(channelsLookup).forEach((slack_channel_id) => {
        delete channelsLookup[slack_channel_id][slack_usergroup_id];
        if (Object.keys(channelsLookup[slack_channel_id]).length === 0) {
            delete channelsLookup[slack_channel_id];
        }
    });
    delete usergroups[slack_usergroup_id];
};

/**
 * Inserts a user to a usergroup
 * @param {String} slack_user_id      Slack id of user to add              (like "UFFFFFF")
 * @param {String} slack_usergroup_id Slack id of usergroup being added to (like "SFFFFFF")
 */
const insertUserForUsergroup = (slack_user_id, slack_usergroup_id) => {
    initSlackUser(slack_user_id);
    initSlackUsergroup(slack_usergroup_id);
    usersLookup[slack_user_id][slack_usergroup_id] = true;
    usergroups[slack_usergroup_id].users_lkup[slack_user_id] = true;
};

const insertUsersForUsergroup = (usergroup) => {
    if (!usergroup || !usergroup.is_usergroup) {
        return false;
    }
    if (!usergroup.users || usergroup.users.length !== usergroup.user_count) {
        usergroups[usergroup.id]._dirty = true;
        return false;
    }
    for (let i = 0; i < usergroup.users.length; i += 1) {
        insertUserForUsergroup(usergroup.users[i], usergroup.id);
    }
    delete usergroups[usergroup.id]._dirty;
    delete usergroups[usergroup.id]._dirty_date;
    return true;
};

const initSlackChannel = (slack_channel_id) => {
    if (!channelsLookup[slack_channel_id]) {
        channelsLookup[slack_channel_id] = {};
    }
};

const dropSlackChannelFromUsergroup = (slack_channel_id, slack_usergroup_id) => {
    delete usergroups[slack_usergroup_id].channels_lkup[slack_channel_id];
    delete channelsLookup[slack_channel_id][slack_usergroup_id];
};

const dropSlackChannel = (slack_channel_id) => {
    Object.keys(channelsLookup[slack_channel_id]).forEach((slack_usergroup_id) => {
        dropSlackChannelFromUsergroup(slack_channel_id, slack_usergroup_id);
    });
    delete channelsLookup[slack_channel_id];
};

const insertChannelForUsergroup = (slack_channel_id, slack_usergroup_id) => {
    initSlackChannel(slack_channel_id);
    initSlackUsergroup(slack_usergroup_id);
    channelsLookup[slack_channel_id][slack_usergroup_id] = true;
    usergroups[slack_usergroup_id].channels_lkup[slack_channel_id] = true;
};

const insertChannelsForUsergroup = (usergroup) => {
    if (!usergroup || !usergroup.is_usergroup) {
        return false;
    }
    if (!usergroup.prefs || !usergroup.prefs.channels) {
        return false;
    }
    usergroup.prefs.channels.forEach((slack_channel_id) => {
        insertChannelForUsergroup(slack_channel_id, usergroup.id);
    });
    return true;
};

const getUsergroupsForChannel = (slack_channel_id) => {
    if (!channelsLookup[slack_channel_id]) {
        return [];
    }
    return Object.keys(channelsLookup[slack_channel_id]);
};

/**
 * Get the associated usergroups for a set of channels
 * @param {Array.<string>} channel_ids The channels to look things up for
 * @return {Array} An array of objects of roughly the following form
 *   {
 *     channel_id: 'C000000',
 *     usergroup_ids: [
 *       'S000',
 *       'SFFF'
 *     ]
 *   }
 */
const getUsergroupsForChannels = (channel_ids) => channel_ids.map(
    (slack_channel_id) => ({
        channel_id: slack_channel_id,
        usergroup_ids: getUsergroupsForChannel(slack_channel_id),
    }),
);

const insertUsergroup = (usergroup) => {
    const normalisedUsergroup = normaliseUsergroup(usergroup);
    if (!normalisedUsergroup || !normalisedUsergroup.is_usergroup) {
        return false;
    }
    let oldState = {};
    const extant = !!(usergroups[normalisedUsergroup.id]);
    if (extant) {
        oldState = {
            // save a few fields for dirty stuff
            users: usergroups[normalisedUsergroup.id].users,
            users_lkup: usergroups[normalisedUsergroup.id].users_lkup,
            user_count: usergroups[normalisedUsergroup.id].user_count,
            // these we discard later, because channels are always passed in full
            prefs: {
                channels: usergroups[normalisedUsergroup.id].prefs.channels,
            },
            channels_lkup: usergroups[normalisedUsergroup.id].channels_lkup,
            date_update: usergroups[normalisedUsergroup.id].date_update,
        };
    }
    usergroups[normalisedUsergroup.id] = normalisedUsergroup;
    initSlackUsergroup(normalisedUsergroup.id);
    // generate usergroup.channels_lkup for the new usergroup object
    insertChannelsForUsergroup(normalisedUsergroup);
    // drop the old channels that weren't in the new data, if any
    if (extant && oldState.prefs && oldState.prefs.channels) {
        oldState.prefs.channels.forEach((slack_channel_id) => {
            if (!normalisedUsergroup.channels_lkup[slack_channel_id]) {
                dropSlackChannelFromUsergroup(slack_channel_id, normalisedUsergroup.id);
            }
        });
    }
    if (extant && normalisedUsergroup.users_count === 0) {
        Object.keys(oldState.users_lkup).forEach((slack_user_id) => {
            dropSlackUserFromUsergroup(slack_user_id, normalisedUsergroup.id);
        });
    } else if (!normalisedUsergroup.users && normalisedUsergroup.user_count > 0) {
        usergroups[normalisedUsergroup.id] = {
            ...normalisedUsergroup,
            users: oldState.users,
            users_lkup: oldState.users_lkup,
            user_count: oldState.user_count,
            _dirty: true,
            _dirty_date: oldState.date_update,
        };
        return false;
    }
    return insertUsersForUsergroup(normalisedUsergroup);
};

/**
 * Inserts usergroups into our thingamajig from an app.client.usergroups.list() call response
 * @param {Object} response API response fetched via app.client.usergroups.list
 * @returns {boolean} True if users were also inserted, false if you need to fetch them via
 *                    app.client.usergroups.users.list
 */
const insertUsergroupsFromAPIListResponse = (response) => {
    if (response.ok !== true || !response.usergroups) {
        return false;
    }
    let result = true;
    const oldGroupsToRemove = {};
    Object.keys(usergroups).forEach((id) => {
        oldGroupsToRemove[id] = true;
    });
    response.usergroups.forEach((u) => {
        result = result && insertUsergroup(u);
        if (u && u.id) {
            delete oldGroupsToRemove[u.id];
        }
    });
    Object.keys(oldGroupsToRemove).forEach((id) => {
        dropSlackUsergroup(id);
    });
    return result;
};

/**
 * Inserts users for a usergroup as fetched by app.client.usergroups.users.list()
 * @param {Object} response API response fetched via app.client.usergroups.users.list
 * @param {String} slack_usergroup_id The Slack id of the relevant usergroup
 * @returns {boolean} Whether the operation was successful or not
 */
const insertUsergroupUsersFromAPIListResponse = (response, slack_usergroup_id) => {
    if (response.ok !== true || !response.users) {
        return false;
    }
    for (let i = 0; i < response.users.length; i += 1) {
        insertUserForUsergroup(response.users[i], slack_usergroup_id);
    }
    delete usergroups[slack_usergroup_id]._dirty;
    delete usergroups[slack_usergroup_id]._dirty_date;
    return true;
};

const isDirty = (slack_usergroup_id) => {
    // non-tracked ugs aren't dirty
    if (!usergroups[slack_usergroup_id]) {
        return false;
    }
    if (usergroups[slack_usergroup_id]._dirty) {
        return true;
    }
    return false;
};

const getUsergroupsForUser = (slack_user_id) => {
    const uo = usersLookup[slack_user_id];
    if (!uo) {
        return [];
    }
    return Object.keys(uo);
};

const getUsersForUsergroup = (slack_usergroup_id) => {
    if (!usergroups[slack_usergroup_id]) {
        return [];
    }
    return usergroups[slack_usergroup_id].users;
};

const getChannelsForUsergroup = (slack_usergroup_id) => {
    if (!usergroups[slack_usergroup_id]) {
        return [];
    }
    return usergroups[slack_usergroup_id].prefs.channels;
};

const isUserInUsergroup = (slack_user_id, slack_usergroup_id) => {
    const uo = usersLookup[slack_user_id];
    if (!uo || !uo[slack_usergroup_id]) {
        return false;
    }
    return true;
};

const processCreationEvent = (response) => {
    if (!response || response.type !== 'subteam_created') {
        return false;
    }
    return insertUsergroup(response.subteam);
};

const processUpdateEvent = (response) => {
    if (!response || response.type !== 'subteam_updated') {
        return false;
    }
    const newUg = response.subteam;
    const oldUg = usergroups[newUg.id];
    if (oldUg && newUg.date_update < oldUg.date_update) {
        console.log(`subteam_updated: data is older than pre-existing data for usergroup ${newUg.id}, ignoring event`);
        return false;
    }
    return insertUsergroup(newUg);
};

const processMembersChangedEvent = (response) => {
    if (!response || response.type !== 'subteam_members_changed') {
        return false;
    }
    const ug = usergroups[response.subteam_id];
    if (!ug) {
        console.log(`received members_changed event for unknown usergroup ${response.subteam_id}`);
        return false;
    }
    if (response.date_previous_update !== ug.date_update) {
        console.log(`subteam_members_changed: update time mismatch for usergroup ${ug.id}, ignoring data`);
        return false;
    }
    if (!isDirty(ug.id) && response.date_update === ug.date_update) {
        console.log(`subteam_members_changed: usergroup ${ug.id} already cleanly up-to-date`);
        return true;
    }
    ug.date_update = response.date_update;
    for (let i = 0; i < response.added_users_count; i += 1) {
        insertUserForUsergroup(response.added_users[i], ug.id);
    }
    for (let i = 0; i < response.removed_users_count; i += 1) {
        dropSlackUserFromUsergroup(response.removed_users[i], ug.id);
    }
    return true;
};

module.exports = {
    // internal functions are denoted with an underscore here
    _clearData,
    _dumpState,
    // helpers for UI stuff
    generateMentionString,
    generatePlaintextString,
    parseMentionString,
    // lookup functions
    getUsergroupsForUser,
    getUsersForUsergroup,
    getChannelsForUsergroup,
    getUsergroupsForChannel,
    getUsergroupsForChannels,
    isUserInUsergroup,
    isDirty,
    // data manipulation functions
    insertUsergroup,
    insertUsergroupsFromAPIListResponse,
    insertUsergroupUsersFromAPIListResponse,
    processCreationEvent,
    processUpdateEvent,
    processMembersChangedEvent,
};
