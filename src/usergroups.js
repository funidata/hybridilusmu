/* eslint-disable camelcase */

/**
 * This is an implementation of usergroup functionality.
 * These are usually known as subteams in Slack API terminology.
 */

/**
 * An object containing the usergroups, keyed by id.
 * Format is roughly the following:
 * ```
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
 * ```
 */
let usergroups = {};

/**
  * A lookup table of users.
  * Format is roughly the following:
  * ```
  *   {
  *     // user is in two usergroups
  *     "UFFFFFF": {"SFFFFFF": true, "S000000": true},
  *     // user is in one usergroup
  *     "U111111": {"SFFFFFF": true}
  *   }
  * ```
 */
let usersLookup = {};

/**
  * A lookup table of channels.
  * Format is roughly the following:
  * ```
  *   {
  *     // channel is set as a default for two usergroups
  *     "CFFFFFF": {"SFFFFFF": true, "S000000": true},
  *     // channel is set as a default for one usergroup
  *     "C111111": {"SFFFFFF": true}
  *   }
  * ```
 */
let channelsLookup = {};

/** Leading part of mention string */
const mentionLead = '<!subteam^';
/** Ending part of mention string */
const mentionTail = '>';

/**
 * Generates a mention string for the given usergroup.
 * @param {string} slack_usergroup_id - The Slack id of the usergroup in question
 * @returns {string} A string that Slack will turn into a mention
 */
const generateMentionString = (slack_usergroup_id) => {
    const label = !usergroups[slack_usergroup_id]
        ? ''
        : `|@${usergroups[slack_usergroup_id].handle}`;
    return `<!subteam^${slack_usergroup_id}${label}>`;
};

/**
 * Reads a usergroup id from a mention string.
 * @param {string} str - String to extract usergroup id from
 * @returns {string} A Slack usergroup id
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
 * @param {string} slack_usergroup_id - The Slack id of the usergroup in question
 * @returns {string} A plain text representation of the usergroup's identity, like
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
 * You probably shouldn't be calling this from outside of the library.
 * Drops all data.
 */
const clearData = () => {
    usergroups = {};
    usersLookup = {};
    channelsLookup = {};
};

/**
 * Gives an insight into what is happening under the hood for debug purposes.
 * You should never use this to modify anything.
 *
 * @returns {Object}
 */
const dumpState = () => ({
    usergroups,
    usersLookup,
    channelsLookup,
});

/**
 * Initialises an entry in the `usersLookup` map for the given Slack user id.
 * The format is described at said symbol's definition towards the start of this file.
 *
 * @see usersLookup
 * @param {string} slack_user_id - Slack user id of the user in question.
 */
const initSlackUser = (slack_user_id) => {
    if (!usersLookup[slack_user_id]) {
        usersLookup[slack_user_id] = {};
    }
};

/**
 * Drops a user from a usergroup
 *
 * @param {string} slack_user_id      - The Slack id of the user to drop
 * @param {string} slack_usergroup_id - The Slack id of the usergroup to drop the user from
 * @returns {void}
 */
const dropSlackUserFromUsergroup = (slack_user_id, slack_usergroup_id) => {
    const ug = usergroups[slack_usergroup_id];
    if (!ug) { return; }
    delete ug._.users_lkup[slack_user_id];
    ug.users.filter((u) => u !== slack_user_id);
    ug.user_count = ug.users.length;
    if (usersLookup[slack_user_id]) {
        delete usersLookup[slack_user_id][slack_usergroup_id];
        if (Object.keys(usersLookup[slack_user_id]).length === 0) {
            delete usersLookup[slack_user_id];
        }
    }
};

/**
 * Drops a Slack user from our lookup tables.
 *
 * @param {string} slack_user_id - The Slack id of the user in question
 * @return {void}
 */
const dropSlackUser = (slack_user_id) => {
    if (usersLookup[slack_user_id]) {
        const groups = Object.keys(usersLookup[slack_user_id]);
        for (let i = 0; i < groups.length; i += 1) {
            dropSlackUserFromUsergroup(slack_user_id, groups[i]);
        }
    }
    delete usersLookup[slack_user_id];
};

/**
 * Initialises an entry in the `usergroups` map for the given usergroup. Also initialises a couple
 * of handy lookup tables for users and channels alike. These live in the sub-object `_`, which is
 * intended for internal book-keeping outside of whatever it is that Slack passes us. This includes,
 * for instance, flags for the usergroup being dirty or not (along with a `dirty_date` field that
 * contains the actual update timestamp of the dirty users).
 *
 * @see usergroups
 * @param {string} slack_usergroup_id - The Slack id of the usergroup in question
 */
const initSlackUsergroup = (slack_usergroup_id) => {
    if (!usergroups[slack_usergroup_id]) {
        usergroups[slack_usergroup_id] = {
            id: `${slack_usergroup_id}`,
        };
    }
    if (!usergroups[slack_usergroup_id]._) {
        usergroups[slack_usergroup_id]._ = {};
    }
    if (!usergroups[slack_usergroup_id]._.users_lkup) {
        usergroups[slack_usergroup_id]._.users_lkup = {};
    }
    if (!usergroups[slack_usergroup_id]._.channels_lkup) {
        usergroups[slack_usergroup_id]._.channels_lkup = {};
    }
};

/**
 * This really shouldn't be needed
 *
 * @param {Object} usergroup - The usergroup object to edit
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

/**
 * Drops a Slack usergroup from our lookup tables
 *
 * @param {string} slack_usergroup_id - Slack id of usergroup to drop
 */
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
 *
 * @param {string} slack_user_id      - Slack id of user to add              (like "UFFFFFF")
 * @param {string} slack_usergroup_id - Slack id of usergroup being added to (like "SFFFFFF")
 */
const insertUserForUsergroup = (slack_user_id, slack_usergroup_id) => {
    initSlackUser(slack_user_id);
    initSlackUsergroup(slack_usergroup_id);
    usersLookup[slack_user_id][slack_usergroup_id] = true;
    usergroups[slack_usergroup_id]._.users_lkup[slack_user_id] = true;
};

/**
 * Inserts users for a Slack usergroup given a Slack usergroup object
 *
 * @param {Object} usergroup - A Slack usergroup object
 * @returns {boolean} Whether the usergroup's users were inserted successfully or not
 */
const insertUsersForUsergroup = (usergroup) => {
    if (!usergroup || !usergroup.is_usergroup) {
        return false;
    }
    if (!usergroup.users || usergroup.users.length !== usergroup.user_count) {
        usergroups[usergroup.id]._.dirty = true;
        return false;
    }
    for (let i = 0; i < usergroup.users.length; i += 1) {
        insertUserForUsergroup(usergroup.users[i], usergroup.id);
    }
    delete usergroups[usergroup.id]._.dirty;
    delete usergroups[usergroup.id]._.dirty_date;
    return true;
};

/**
 * Initialises a lookup object in `channelsLookup` for a given channel.
 *
 * @see channelsLookup
 * @param {string} slack_channel_id - The Slack id of the channel in question
 */
const initSlackChannel = (slack_channel_id) => {
    if (!channelsLookup[slack_channel_id]) {
        channelsLookup[slack_channel_id] = {};
    }
};

/**
 * Drops a Slack channel from a given usergroup
 *
 * @param {string} slack_channel_id   - The Slack id of the channel in question
 * @param {string} slack_usergroup_id - The Slack id of the usergroup in question
 */
const dropSlackChannelFromUsergroup = (slack_channel_id, slack_usergroup_id) => {
    delete usergroups[slack_usergroup_id]._.channels_lkup[slack_channel_id];
    delete channelsLookup[slack_channel_id][slack_usergroup_id];
};

/**
 * Drops a Slack channel from all of its associated usergroups
 *
 * @param {string} slack_channel_id - The Slack id of the channel in question
 */
const dropSlackChannel = (slack_channel_id) => {
    Object.keys(channelsLookup[slack_channel_id]).forEach((slack_usergroup_id) => {
        dropSlackChannelFromUsergroup(slack_channel_id, slack_usergroup_id);
    });
    delete channelsLookup[slack_channel_id];
};

/**
 * Inserts a channel for a given usergroup into our lookup tables
 *
 * @param {string} slack_channel_id   - The Slack id of the channel in question
 * @param {string} slack_usergroup_id - The Slack id of the usergroup in question
 */
const insertChannelForUsergroup = (slack_channel_id, slack_usergroup_id) => {
    initSlackChannel(slack_channel_id);
    initSlackUsergroup(slack_usergroup_id);
    channelsLookup[slack_channel_id][slack_usergroup_id] = true;
    usergroups[slack_usergroup_id]._.channels_lkup[slack_channel_id] = true;
};

/**
 * Inserts a given usergroup object's channels into our various lookup tables
 *
 * @param {Object} usergroup - A Slack usergroup object
 * @returns {boolean} Whether the operation was successful or not
 */
const insertChannelsForUsergroup = (usergroup) => {
    // not an object or not a usergroup
    if (!usergroup || !usergroup.is_usergroup) {
        return false;
    }
    // malformed object
    if (!usergroup.prefs || !usergroup.prefs.channels) {
        return false;
    }
    usergroup.prefs.channels.forEach((slack_channel_id) => {
        insertChannelForUsergroup(slack_channel_id, usergroup.id);
    });
    return true;
};

/**
 * Returns whether a given usergroup is enabled or not.
 *
 * @param {string} slack_usergroup_id - Slack usergroup id
 * @returns {boolean} Whether said usergroup is enabled or not
 */
const isEnabled = (slack_usergroup_id) => {
    // unknown usergroups are assumed to be disabled
    // note that disabled usergroups are by default omitted from usergroup listings provided by
    // Slack, unless otherwise specified by a request
    if (!usergroups[slack_usergroup_id]) {
        return false;
    }
    // if the date_delete field is set to something other than 0, the usergroup is disabled
    if (usergroups[slack_usergroup_id].date_delete !== 0) {
        return false;
    }
    return true;
};

const getUsergroups = () => Object.keys(usergroups).filter(isEnabled);

/**
 * Returns an array of usergroup ids for the given channel.
 *
 * @param {string} slack_channel_id - Slack channel id
 * @returns {Array.<string>} An array of usergroup ids of enabled usergroups
 */
const getUsergroupsForChannel = (slack_channel_id) => {
    if (!channelsLookup[slack_channel_id]) {
        return [];
    }
    return Object.keys(channelsLookup[slack_channel_id]).filter(isEnabled);
};

/**
 * Get the associated usergroups for a set of channels
 * @param {Array.<string>} channel_ids - The channels to look things up for
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

/**
 * Inserts a Slack usergroup object into our lookup tables.
 * You shouldn't call this directly from outside of the library.
 *
 * @param {Object} usergroup - A Slack usergroup object
 * @returns {boolean} Whether the operation was completed successfully or not
 *                    If false, you should probably pass in users via
 *                    `insertUsergroupUsersFromAPIListResponse()`.
 *
 * @see usergroups     - Our main usergroup lookup object, housing usergroup data
 * @see usersLookup    - Our user -> usergroup lookup object
 * @see channelsLookup - Our channel -> usergroup lookup object
 *
 * @see insertUsergroupsFromAPIListResponse - Insertion via API usergroups.list response
 * @see insertUsergroupUsersFromAPIListResponse - Insertion of users via usergroups.users.list
 *                                              response
 * @see processCreationEvent - Insertion via subteam_created event type
 * @see processUpdateEvent   - Insertion via subteam_updated event type
 */
const insertUsergroup = (usergroup) => {
    const normalisedUsergroup = normaliseUsergroup(usergroup);
    if (!normalisedUsergroup || !normalisedUsergroup.is_usergroup) {
        return false;
    }
    let oldState = { _: {} };
    const extant = !!(usergroups[normalisedUsergroup.id]);
    if (extant) {
        oldState = {
            // save a few fields for dirty stuff
            users: usergroups[normalisedUsergroup.id].users,
            user_count: usergroups[normalisedUsergroup.id].user_count,
            // these we discard later, because channels are always passed in full
            prefs: {
                channels: usergroups[normalisedUsergroup.id].prefs.channels,
            },
            _: {
                users_lkup: usergroups[normalisedUsergroup.id]._.users_lkup,
                channels_lkup: usergroups[normalisedUsergroup.id]._.channels_lkup,
            },
            date_update: usergroups[normalisedUsergroup.id].date_update,
        };
    }
    usergroups[normalisedUsergroup.id] = normalisedUsergroup;
    // make sure we've initialised things properly
    initSlackUsergroup(normalisedUsergroup.id);
    // generate usergroup._.channels_lkup for the new usergroup object
    insertChannelsForUsergroup(normalisedUsergroup);
    // drop the old channels that weren't in the new data, if any
    if (extant && oldState.prefs && oldState.prefs.channels) {
        oldState.prefs.channels.forEach((slack_channel_id) => {
            if (!normalisedUsergroup._.channels_lkup[slack_channel_id]) {
                dropSlackChannelFromUsergroup(slack_channel_id, normalisedUsergroup.id);
            }
        });
    }
    if (extant && normalisedUsergroup.users_count === 0) {
        // if no users were found for this usergroup, make sure to drop any pre-existing ones
        Object.keys(oldState._.users_lkup).forEach((slack_user_id) => {
            dropSlackUserFromUsergroup(slack_user_id, normalisedUsergroup.id);
        });
    } else if (!normalisedUsergroup.users && normalisedUsergroup.user_count > 0) {
        // if users weren't passed in, yet there should be some, we use our pre-existing
        // user list and set this usergroup to be dirty. this allows us to fetch the user list
        // via Bolt, to be fed in via insertUsergroupUsersFromAPIListResponse()
        // NOTE: Slack by default does not include the .users array in its usergroups.list response,
        //       unless you specify it in some sort of extra parameter.
        usergroups[normalisedUsergroup.id] = {
            ...normalisedUsergroup,
            users: oldState.users,
            user_count: oldState.user_count,
            _: {
                users_lkup: oldState._.users_lkup,
                dirty: true,
                dirty_date: oldState.date_update,
            },
        };
        return false;
    }
    return insertUsersForUsergroup(normalisedUsergroup);
};

/**
 * Inserts usergroups into our thingamajig from an app.client.usergroups.list() call response
 *
 * @param {Object} response - API response fetched via app.client.usergroups.list
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
        const insertionOkay = insertUsergroup(u);
        result = result && insertionOkay;
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
 *
 * @param {Object} response - API response fetched via app.client.usergroups.users.list
 * @param {string} slack_usergroup_id - The Slack id of the relevant usergroup
 * @returns {boolean} Whether the operation was successful or not
 */
const insertUsergroupUsersFromAPIListResponse = (response, slack_usergroup_id) => {
    if (response.ok !== true || !response.users) {
        return false;
    }
    for (let i = 0; i < response.users.length; i += 1) {
        insertUserForUsergroup(response.users[i], slack_usergroup_id);
    }
    delete usergroups[slack_usergroup_id]._.dirty;
    delete usergroups[slack_usergroup_id]._.dirty_date;
    return true;
};

/**
 * Checks whether a usergroup is dirty or not.
 *
 * A usergroup being dirty means that it has some stale data.
 *
 * @param {string} - slack_usergroup_id The Slack id of the usergroup in question
 * @returns {boolean} Whether the data for this usergroup is dirty or not. This
 *                    means that the user list is potentially out-of-date while
 *                    the usergroup info itself might be up-to-date.
 */
const isDirty = (slack_usergroup_id) => {
    // non-tracked ugs aren't dirty
    if (!usergroups[slack_usergroup_id]) {
        return false;
    }
    if (usergroups[slack_usergroup_id]._.dirty) {
        return true;
    }
    return false;
};

/**
 * Gets all the (enabled) usergroups that a user belongs to.
 *
 * @param {string} slack_user_id - The Slack id of the user in question
 * @returns {Array.<string>} An array of Slack usergroup ids
 */
const getUsergroupsForUser = (slack_user_id) => {
    const uo = usersLookup[slack_user_id];
    if (!uo) {
        return [];
    }
    return Object.keys(uo).filter(isEnabled);
};

/**
 * Gets all the users associated with a given usergroup.
 *
 * We pay no mind to whether the usergroup is enabled or not.
 *
 * @param {string} slack_usergroup_id - The Slack id of the usergroup in question
 * @returns {Array.<string>} An array of Slack user ids
 */
const getUsersForUsergroup = (slack_usergroup_id) => {
    if (!usergroups[slack_usergroup_id]) {
        return [];
    }
    return [...usergroups[slack_usergroup_id].users];
};

/**
 * Gets all the channels associated with a given usergroup.
 *
 * We pay no mind to whether the usergroup is enabled or not.
 *
 * @param {string} slack_usergroup_id - The Slack id of the usergroup in question
 * @returns {Array.<string>} An array of Slack channel ids
 */
const getChannelsForUsergroup = (slack_usergroup_id) => {
    if (!usergroups[slack_usergroup_id]) {
        return [];
    }
    return [...usergroups[slack_usergroup_id].prefs.channels];
};

/**
 * Checks whether a user belongs to a given usergroup or not.
 *
 * @param {string} slack_user_id      - The Slack id of the user in question
 * @param {string} slack_usergroup_id - The Slack id of the usergroup in question
 * @returns {boolean} Whether the user belongs to the usergroup or not.
 */
const isUserInUsergroup = (slack_user_id, slack_usergroup_id) => {
    const uo = usersLookup[slack_user_id];
    if (!uo || !uo[slack_usergroup_id]) {
        return false;
    }
    return true;
};

/**
 * Processes a Slack usergroup creation event (`subteam_created`)
 *
 * @param {Object} response - The Slack event object
 * @returns {boolean} Whether the operation was successful or not
 *
 * @see processUpdateEvent
 * @see processMembersChangedEvent
 */
const processCreationEvent = (response) => {
    if (!response || response.type !== 'subteam_created') {
        return false;
    }
    return insertUsergroup(response.subteam);
};

/**
 * Processes a Slack usergroup update event (`subteam_updated`)
 *
 * Note that according to Slack these events have a limit of 500 users
 * being listed in the usergroup. This means you may have dirty data
 * after calling this function.
 *
 * Look at `insertUsergroupUsersFromAPIListResponse()` for more info.
 *
 * @param {Object} response - The Slack event object
 * @returns {boolean} Whether the operation was successful or not
 *
 * @see insertUsergroupUsersFromAPIListResponse
 *
 * @see processCreationEvent
 * @see processMembersChangedEvent
 */
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

/**
 * Processes a Slack usergroup member change event (`subteam_members_changed`)
 *
 * @param {Object} response - The Slack event object
 * @returns {boolean} Whether the operation was successful or not
 *
 * @see processCreationEvent
 * @see processUpdateEvent
 */
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
    // internal functions
    _: {
        clearData,
        dumpState,
    },
    // helpers for UI stuff
    generateMentionString,
    generatePlaintextString,
    parseMentionString,
    // lookup functions
    getUsergroups,
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
