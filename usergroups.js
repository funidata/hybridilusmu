
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
    return false
  }
  for (let i = 0; i < usergroups.users.length; ++i) {
    insertUserForUsergroup(usergroups.users[i], usergroup.id)
  }
}

const insertUsergroup = (usergroup) => {
  if (!usergroup || !usergroup.is_usergroup) {
    return false
  }
  usergroups[usergroup.id] = usergroup
  if (!usergroup.users) {
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

const insertUsergroupUsersFromAPIListResponse = (response, slack_usergroup_id) => {
  if (response.ok !== true || !response.users) {
    return false
  }
  for (let i = 0; i < response.users.length; ++i) {
    insertUserForUsergroup(response.users[i], slack_usergroup_id)
  }
}

module.exports = {
  insertUsergroup,
  insertUsergroupsFromAPIListResponse,
  insertUsergroupUsersFromAPIListResponse
}
