const helper = require('./helperFunctions');
const home = require('./home');

exports.enableMiddleware = function (app) {
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

    /**
    * Try to cache our user data so that getUserRestriction() doesn't bump into rate limits
    * @param {*} userId
    * @returns {Object} The user object as originally returned by Slack
    */
    async function getCachedUser(userId) {
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
    }

    /**
    * Get the restriction/guest value of the given user from Slack API.
    * @param {*} userId
    * @returns True if the user is restricted.
    */
    async function getUserRestriction(userId) {
        const user = await getCachedUser(userId);
        // if we don't have a successful api call, default to restriction
        if (!user || user.is_restricted === undefined) {
            return true;
        }
        return user.is_restricted;
    }

    /**
    * Bolt global middleware (runs before every request) that checks if the user
    * is a guest (restricted), and if so, stops further processing of the request,
    * displaying an error message instead.
    */
    async function guestHandler({payload, body, client, next, ack, event}) {
        // The user ID is found in many different places depending on the type of action taken
        let userId; // Undefined evaluates as false
        if (!userId) try { userId = payload.user; } catch (error) {} // tab
        if (!userId) try { userId = payload.user_id; } catch (error) {} // slash command
        if (!userId) try { userId = body.user.id; } catch (error) {} // button
        if (!userId) try { userId = body.event.message.user; } catch (error) {} // message edit
        // Approve requests which don't include any of the above (couldn't find any)
        if (!userId) {
            console.log('alert: guest check skipped!');
            await next();
            return;
        }
        try {
            if (await getUserRestriction(userId)) {
                throw new Error('User is restricted');
            }
        } catch (error) {
        // This user is restricted. Show them an error message and stop processing the request
            if (error.message === 'User is restricted') {
                if (event !== undefined && (event.channel_type === 'channel' || event.channel_type === 'group')) { // Don't send the error message in this case
                    return;
                }
                const message = `Pahoittelut, <@${userId}>. Olet vieraskäyttäjä tässä Slack-työtilassa, joten et voi käyttää tätä bottia.`;
                if (payload.command !== undefined) { // Responds to a slash-command
                    await ack();
                    helper.postEphemeralMessage(app, payload.channel_id, userId, message);
                } else if (payload.channel === undefined || payload.tab === 'home') { // Shows an error message on the home tab.
                    home.error(client, userId, message);
                } else { // Responds to a private message with an ephemeral message.
                    helper.postEphemeralMessage(app, payload.channel, userId, message);
                }
                return;
            }
            // Pass control to previous middleware (if any) or the global error handler
            throw error;
        }
        // Pass control to the next middleware (if there are any) and the listener functions
        // Note: You probably don't want to call this inside a `try` block, or any middleware
        // after this one that throws will be caught by it.
        await next();
    }

    app.use(guestHandler);
};
