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

/** Maximum age of stored objects in cache */
const OBJECT_AGE = 60000;

module.exports = {
    enableUserCache: ({ app }) => {
        /**
         * Try to cache our user data so that getUserRestriction() doesn't bump into rate limits
         * @param {*} userId
         * @returns {Object} The user object as originally returned by Slack
         */
        const getCachedUser = async (userId) => {
            // don't bother with undefineds and nulls and falses and empty strings and such
            // these caused some api errors too at some point in earlier development
            if (!userId) {
                return null;
            }
            if (usercache[userId] && usercache[userId].date + OBJECT_AGE > Date.now()) {
                console.log(`cache hit for user ${userId}`);
                return usercache[userId].user;
            }
            try {
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
                    date: Date.now(),
                };
                return user.user;
            } catch (err) {
                console.log(`users.info failed for uid ${userId}: ${err}`);
            }
            return null;
        };

        /**
         * Generates a plain text string for the Slack user in question.
         *
         * You should call and wait on `getCachedUser(userId)` before calling this function.
         *
         * @param {string} userId - Slack user id
         * @returns {string} User's real name or username and a mention tag. If user hasn't been cached,
         *                   falls back to generating a mention string (`<@${userId}>`).
         *
         * @see getCachedUser
         */
        const generatePlaintextString = (userId) => {
            if (!userId) {
                return '';
            }
            const u = usercache[userId];
            if (!u) {
                // fall back to a mention string if user is not found
                return `<@${userId}>`;
            }
            return `${u.user.profile.real_name || u.user.profile.display_name} (<@${userId}>)`;
        };

        return {
            getCachedUser,
            generatePlaintextString,
        };
    },
};
