const home = require('./home');
const scheduleMessage = require('./scheduleMessage');

exports.enableEventListeners = ({ app, usergroups }) => {
    /**
    * Updates the App-Home page for the specified user when they click on the Home tab.
    */
    app.event('app_home_opened', async ({ event, client }) => {
        home.update(client, event.user);
    });

    /**
     * Event listener for usergroup creation events
     */
    app.event('subteam_created', async ({ event }) => {
        const { id } = event.subteam;
        const { type } = event;
        const ret = usergroups.processCreationEvent(event);
        const shorthand = usergroups.generatePlaintextString(id);
        console.log(`ug ${shorthand} <${id}>: ${type}, returning ${ret}`);
    });

    /**
     * Event listener for usergroup update events
     */
    app.event('subteam_updated', async ({ event }) => {
        const { id } = event.subteam;
        const { type } = event;
        const ret = usergroups.processUpdateEvent(event);
        const shorthand = usergroups.generatePlaintextString(id);
        console.log(`ug ${shorthand} <${id}>: ${type}, returning ${ret}`);
        // The usergroup user-list state can be dirty after an update event,
        // as slack truncates the users-array to 500 elements.
        if (!ret) {
            console.log(`ug ${shorthand} <${id}> is dirty, refreshing users`);
            const users = await app.client.usergroups.users.list({ usergroup: id });
            const res = usergroups.insertUsergroupUsersFromAPIListResponse(users, id);
            if (!res) {
                console.log(`ug ${shorthand} <${id}> remains dirty after failed refresh`);
            }
        }
    });

    /**
     * Event listener for usergroup member change events
     */
    app.event('subteam_members_changed', async ({ event }) => {
        const id = event.subteam_id;
        const { type } = event;
        const ret = usergroups.processMembersChangedEvent(event);
        const shorthand = usergroups.generatePlaintextString(id);
        console.log(`ug ${shorthand} <${id}>: ${type}, returning ${ret}`);
    });

    /**
     * Event listener for channel member join events
     */
    app.event('member_joined_channel', async ({ event }) => {
        try {
            // if the bot joins a channel, then an automatic message is scheduled for that channel with the default time
            if (app.client.auth.test.bot_id === event.bot) {
                const channelId = event.channel;
                scheduleMessage.scheduleMessage({ channelId, app, usergroups });
            }
        } catch (error) {
            console.error(error);
        }
    });

    /**
     * Event listener for channel member left events
     * Doesn't work, here's why:
     * "This event is supported as a bot user subscription in the Events API.
     * Workspace event subscriptions are also available for tokens
     * holding at least one of the channels:read or groups:read scopes.
     * Which events your app will receive depends on the scopes and their context.
     * For instance, you'll only receive member_left_channel events
     * for private channels if your app has the groups:read permission."
     */
    app.event('member_left_channel', async ({ event }) => {
        try {
            console.log('someone left channel', event.channel);
            // if the bot joins a channel, then the automatic message is removed for that channel
            if (app.client.auth.test.bot_id === event.bot) { // something like this
                console.log('it was me!');
                const { channelId } = event.channel;
                scheduleMessage.unScheduleMessage({ channelId });
            }
        } catch (error) {
            console.error(error);
        }
    });
};
