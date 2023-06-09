const { DateTime } = require('luxon');

const schedule = require('node-schedule');
const service = require('./databaseService');
const helper = require('./helperFunctions');
const library = require('./responses');
const { generatePlaintextString } = require('./userCache')

const jobs = new Map();

async function unScheduleMessage({ channelId }) {
    const foundJob = jobs.get(channelId);
    if (foundJob) {
        service.removeJob(channelId);
        foundJob.cancel();
        console.log('unscheduled from', channelId);
    }
}

async function postRegistrationsWithoutNotifications(app, registrations, channelId) {
    const messageWithoutMentions = library.registrationList(
        DateTime.now(),
        registrations,
        generatePlaintextString
    );
    // First post the registrations without the mention tags,
    // so we don't send obnoxious notifications to everyone.
    const messageId = (await helper.postMessage(app, channelId, messageWithoutMentions)).ts;
    const messageWithMentions = library.registrationList(
        DateTime.now(),
        registrations,
    )
    // Now edit the message that was just sent by adding mention tags
    // This way we're not sending unnecessary notifications.
    helper.editMessage(app, channelId, messageId, messageWithMentions)
}

async function postRegistrationsWithUsergroupWithoutNotifications(
    app,
    registrations,
    channelId,
    usergroups,
    usergroupId) {
    const messageWithoutMentions = library.registrationListWithUsergroup(
        DateTime.now(),
        registrations,
        usergroups.generatePlaintextString(usergroupId),
        generatePlaintextString
    )

    const messageId = (await helper.postMessage(app, channelId, messageWithoutMentions)).ts
    const messageWithMentions = library.registrationListWithUsergroup(
        DateTime.now(),
        registrations,
        usergroups.generatePlaintextString(usergroupId),
    )
    helper.editMessage(app, channelId, messageId, messageWithMentions)
}

const sendScheduledMessage = async (app, channelId, usergroups, userCache) => {
    console.log('delivering scheduled posts')
    const isMember = await helper.isBotChannelMember(app, channelId)
    // remove job from channel the bot is no longer a member of
    if (!isMember) {
        unScheduleMessage({ channelId })
        return
    }
    const registrations = await service.getRegistrationsFor(DateTime.now().toISODate())
    // Freshen up user cache to provide data for string generation
    const userPromises = registrations.map((uid) => userCache.getCachedUser(uid))
    // Wait for said freshening up to finish before continuing with message generation.
    // Otherwise we can get empty strings for all our users, unless they've already used the application
    // during this particular execution of the application. (Trust me, it's happened to me.)
    await Promise.all(userPromises)

    const usergroupIds = usergroups.getUsergroupsForChannel(channelId)
    // No Slack user groups are added to this channel.
    // Send normal message containing everyone that is registered.
    if (usergroupIds.length === 0) {
        postRegistrationsWithoutNotifications(app, registrations, channelId)
    } else {
        // Send a separate list of registered users from each
        // Slack user group in this channel
        usergroupIds.forEach(async (usergroupId) => {
            const filteredRegistrations = registrations.filter(
                (userId) => usergroups.isUserInUsergroup(userId, usergroupId),
            );
            postRegistrationsWithUsergroupWithoutNotifications(
                app,
                filteredRegistrations,
                channelId,
                usergroups,
                usergroupId)
        });
    }
}

/**
 * Schedules a job to send a daily message to the given channel at the given or default time.
 * Creates or updates both entires in both the Map and the database.
 * @param {String} channelId
 * @param {DateTime} time Optional. Only the time part is used.
 * @param app Optional. Needed only when creating a job.
 * @param usergroups Optional. Needed only when creating a job.
 */
async function scheduleMessage({
    channelId, time, app, usergroups, userCache,
}) {
    const rule = new schedule.RecurrenceRule();
    rule.tz = 'Europe/Helsinki';
    rule.dayOfWeek = [1, 2, 3, 4, 5];
    rule.hour = time ? time.hour : 6; // use given or default time
    rule.minute = time ? time.minute : 0;
    // rule.second = [0, 15, 30, 45]; // for testing
    // rule.second = time ? time.hour : 1; // also for testing

    const foundJob = jobs.get(channelId);
    if (foundJob) { // update job
        await service.addJob(channelId, time ? time.toSQLTime() : null);
        foundJob.reschedule(rule);
    } else { // create job
        const sendMessage = () => sendScheduledMessage(app, channelId, usergroups, userCache)
        // 1st arg: when to execute, 2nd arg: what to execute
        const job = schedule.scheduleJob(rule, sendMessage)
        // add the job to the map so that we can reschedule it later
        jobs.set(channelId, job);
    }
}

/**
* Schedules jobs to send a daily message to every channel the bot is a member of.
*/
async function startScheduling({ app, usergroups, userCache }) {
    let channels = await helper.getMemberChannelIds(app);
    channels = channels.map((channel) => ({
        channel_id: channel,
    }));
    await service.addAllJobs(channels); // add all those channels that are not in the db yet
    console.log('Scheduling every Job found in the database');
    const allJobs = await service.getAllJobs()
    await Promise.all(allJobs.map((job) => {
        const channelId = job.channelId
        const time = job.time ? DateTime.fromSQL(job.time) : null
        return scheduleMessage({
            channelId, time, app, usergroups, userCache
        })
    }))
}

/**
 * Schedules usergroup readings
 * @param {*} app Slack app instance
 * @param {*} usergroups Usergroup cache instance
 */
const scheduleUsergroupReadings = async ({ app, usergroups }) => {
    const procedure = async () => {
        helper.readUsergroupsFromCleanSlate({ app, usergroups });
    };
    const everyNight = new schedule.RecurrenceRule();
    everyNight.tz = 'Etc/UTC';
    everyNight.hour = 0;
    everyNight.minute = 25;
    console.log(`scheduling nightly usergroup reads at ${everyNight.hour}h ${everyNight.minute}m (${everyNight.tz})`);
    schedule.scheduleJob(everyNight, procedure);
    // also run it _now_
    procedure();
};

module.exports = {
    unScheduleMessage,
    startScheduling,
    scheduleMessage,
    scheduleUsergroupReadings,
};
