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

module.exports = {
    enableUserCache: ({ app }) => {
        /**
         * Try to cache our user data so that getUserRestriction() doesn't bump into rate limits
         * @param {*} userId
         * @returns {Object} The user object as originally returned by Slack
         */
        const getCachedUser = async (userId) => {
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
        };

        return {
            getCachedUser,
        };
    },
};
