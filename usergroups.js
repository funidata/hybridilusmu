
/**
 * This is an implementation of usergroup functionality.
 * These are usually known as subteams in Slack API terminology.
 */

/**
 * Generates a mention string for the given usergroup.
 * @param {String} slack_usergroup_id The Slack id of the usergroup in question
 * @returns {String} A string that Slack will turn into a mention
 */
 const generateMentionString = (slack_usergroup_id) => "<!subteam^" + slack_usergroup_id + ">"

 /**
  * Generates a plaintext string describing a usergroup.
  * @param {String} slack_usergroup_id The Slack id of the usergroup in question
  * @returns {String} A plain text representation of the usergroup's identity, like "Kahvinkittaajat (@kahvi)"
  */
 const generatePlaintextString = (slack_usergroup_id) => {
  const ug = usergroups[slack_usergroup_id]
   if (!ug) {
     return ""
   }
   return ug.name + " (@" + ug.handle + ")"
 }

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
 *       users: [
 *         "UFFFFFF",
 *         "U111111"
 *       ],
 *       user_count: 2
 *     }
 *   }
 */
let usergroups = {}

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
let usersLookup = {}

/**
 * You probably shouldn't be calling this from outside of the library
 */
const _clearData = () => {
  usergroups = {}
  usersLookup = {}
}

const _dumpState = () => {
  return {
    usergroups,
    usersLookup
  }
}

const initSlackUser = (slack_user_id) => {
  if (!usersLookup[slack_user_id]) {
    usersLookup[slack_user_id] = {}
  }
}

const dropSlackUserFromUsergroup = (slack_user_id, slack_usergroup_id) => {
  const ug = usergroups[slack_usergroup_id]
  if (!ug) { return; }
  delete ug.users_lkup[slack_user_id]
  ug.users.filter((u) => u !== slack_user_id)
  ug.user_count = ug.users.length
  if (usersLookup[slack_user_id]) {
    delete usersLookup[slack_user_id][slack_usergroup_id]
    if (0 === Object.keys(usersLookup[slack_user_id]).length) {
      delete usersLookup[slack_user_id]
    }
  }
}

const dropSlackUser = (slack_user_id) => {
  if (usersLookup[slack_user_id]) {
    const groups = Object.keys(usersLookup[slack_user_id])
    for (let i = 0; i < groups.length; ++i) {
      dropSlackUserFromUsergroup(slack_user_id, slack_usergroup_id)
    }
  }
  delete usersLookup[slack_user_id]
}

const initSlackUsergroup = (slack_usergroup_id) => {
  if (!usergroups[slack_usergroup_id]) {
    usergroups[slack_usergroup_id] = {
      id: "" + slack_usergroup_id
    }
  }
  if (!usergroups[slack_usergroup_id].users_lkup) {
    usergroups[slack_usergroup_id].users_lkup = {}
  }
}

/**
 * This really shouldn't be needed
 * @param {Object} usergroup The usergroup object to edit
 * @returns {void}
 */
const normaliseUsergroup = (usergroup) => {
  if (!usergroup) {
    return
  }
  if (typeof usergroup.user_count === 'string') {
    usergroup.user_count = 1 * usergroup.user_count
  }
  if (typeof usergroup.channel_count === 'string') {
    usergroup.channel_count = 1 * usergroup.channel_count
  }
}

const dropSlackUsergroup = (slack_usergroup_id) => {
  Object.keys(usersLookup).forEach((slack_user_id) => {
    delete usersLookup[slack_user_id][slack_usergroup_id]
    if (Object.keys(usersLookup[slack_user_id]).length === 0) {
      dropSlackUser(slack_user_id)
    }
  })
  delete usergroups[slack_usergroup_id]
}

/**
 * Inserts a user to a usergroup
 * @param {string} slack_user_id      Slack id of user to add              (like "UFFFFFF")
 * @param {string} slack_usergroup_id Slack id of usergroup being added to (like "SFFFFFF")
 */
const insertUserForUsergroup = (slack_user_id, slack_usergroup_id) => {
  initSlackUser(slack_user_id)
  initSlackUsergroup(slack_usergroup_id)
  usersLookup[slack_user_id][slack_usergroup_id] = true
  usergroups[slack_usergroup_id].users_lkup[slack_user_id] = true
}

const insertUsersForUsergroup = (usergroup) => {
  if (!usergroup || !usergroup.is_usergroup) {
    return false
  }
  if (!usergroup.users || usergroup.users.length !== usergroup.user_count) {
    usergroup._dirty = true
    return false
  }
  for (let i = 0; i < usergroup.users.length; ++i) {
    insertUserForUsergroup(usergroup.users[i], usergroup.id)
  }
  delete usergroup._dirty
  delete usergroup._dirty_date
  return true
}

const insertUsergroup = (usergroup) => {
  normaliseUsergroup(usergroup)
  if (!usergroup || !usergroup.is_usergroup) {
    return false
  }
  let oldState = {}
  if (usergroups[usergroup.id]) {
    oldState = {
      users: usergroups[usergroup.id].users,
      users_lkup: usergroups[usergroup.id].users_lkup,
      user_count: usergroups[usergroup.id].user_count,
      _dirty_date: usergroups[usergroup.id].date_update
    }
  }
  usergroups[usergroup.id] = usergroup
  if (!usergroup.users && usergroup.user_count > 0) {
    usergroup._dirty = true
    usergroups[usergroup.id] = {...usergroup, ...oldState}
    return false
  }
  return insertUsersForUsergroup(usergroup)
}

/**
 * Inserts usergroups into our thingamajig from an app.client.usergroups.list() call response
 * @param {Object} response API response fetched via app.client.usergroups.list
 * @returns {boolean} True if users were also inserted, false if you need to fetch them via app.client.usergroups.users.list
 */
const insertUsergroupsFromAPIListResponse = (response) => {
  if (response.ok !== true || !response.usergroups) {
    return false
  }
  let result = true
  response.usergroups.forEach((u) => {
    result = result && insertUsergroup(u)
  })
  return result
}

/**
 * Inserts users for a usergroup as fetched by app.client.usergroups.users.list()
 * @param {Object} response API response fetched via app.client.usergroups.users.list
 * @param {String} slack_usergroup_id The Slack id of the relevant usergroup
 * @returns {boolean} Whether the operation was successful or not
 */
const insertUsergroupUsersFromAPIListResponse = (response, slack_usergroup_id) => {
  if (response.ok !== true || !response.users) {
    return false
  }
  for (let i = 0; i < response.users.length; ++i) {
    insertUserForUsergroup(response.users[i], slack_usergroup_id)
  }
  delete usergroups[slack_usergroup_id]._dirty
  delete usergroups[slack_usergroup_id]._dirty_date
  return true
}

const isDirty = (slack_usergroup_id) => {
  // non-tracked ugs aren't dirty
  if (!usergroups[slack_usergroup_id]) {
    return false
  }
  if (usergroups[slack_usergroup_id]._dirty) {
    return true
  }
  return false
}

const getUsergroupsForUser = (slack_user_id) => {
  const uo = usersLookup[slack_user_id]
  if (!uo) {
    return []
  }
  return Object.keys(uo)
}

const isUserInUsergroup = (slack_user_id, slack_usergroup_id) => {
  const uo = usersLookup[slack_user_id]
  if (!uo || !uo[slack_usergroup_id]) {
    return false
  }
  return true
}

const processCreationEvent = (response) => {
  if (!response || response.type !== 'subteam_created') {
    return false
  }
  return insertUsergroup(response.subteam)
}

const processUpdateEvent = (response) => {
  if (!response || response.type !== 'subteam_updated') {
    return false
  }
  return insertUsergroup(response.subteam)
}

const processMembersChangedEvent = (response) => {
  if (!response || response.type !== 'subteam_members_changed') {
    return false
  }
  const ug = usergroups[response.subteam_id]
  if (!ug) {
    console.log(`received members_changed event for unknown usergroup ${response.subteam_id}`)
    return false
  }
  if (response.date_previous_update !== ug.date_update) {
    console.log(`subteam_members_changed: update time mismatch for usergroup ${ug.id}, ignoring data`)
    return false
  }
  if (!isDirty(ug.id) && response.date_update === ug.date_update) {
    console.log(`subteam_members_changed: usergroup ${ug.id} already cleanly up-to-date`)
    return true
  }
  ug.date_update = response.date_update
  for (let i = 0; i < response.added_users_count; ++i) {
    insertUserForUsergroup(response.added_users[i], ug.id)
  }
  for (let i = 0; i < response.removed_users_count; ++i) {
    dropSlackUserFromUsergroup(response.removed_users[i], ug.id)
  }
  return true
}

module.exports = {
  // internal functions are denoted with an underscore here
  _clearData,
  _dumpState,
  // helpers for UI stuff
  generateMentionString,
  generatePlaintextString,
  // lookup functions
  getUsergroupsForUser,
  isUserInUsergroup,
  isDirty,
  // data manipulation functions
  insertUsergroup,
  insertUsergroupsFromAPIListResponse,
  insertUsergroupUsersFromAPIListResponse,
  processCreationEvent,
  processUpdateEvent,
  processMembersChangedEvent
}
