const { DateTime } = require('luxon');

const schedule = require('node-schedule');
const service = require('./databaseService');
const helper = require('./helperFunctions');
const library = require('./responses');

const jobs = new Map();

async function unScheduleMessage({ channelId }) {
    const foundJob = jobs.get(channelId);
    if (foundJob) {
        service.removeJob(channelId);
        foundJob.cancel();
        console.log('unscheduled from', channelId);
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
        const job = schedule.scheduleJob(rule, async () => {
            console.log('delivering scheduled posts');
            // Parallelize membership info fetching
            const memberPromise = helper.isBotChannelMember(app, channelId);
            // We have to await on registrations, because they're needed for user fetching
            const registrations = await service.getRegistrationsFor(DateTime.now().toISODate());
            // Freshen up user cache to provide data for string generation
            const userPromises = registrations.map((uid) => userCache.getCachedUser(uid));
            // Wait for said freshening up to finish before continuing with message generation.
            // Otherwise we can get empty strings for all our users, unless they've already used the application
            // during this particular execution of the application. (Trust me, it's happened to me.)
            await Promise.all(userPromises);
            // Read our membership info from its promise
            const isMember = await memberPromise;
            // remove job from channel the bot is no longer a member of
            if (!isMember) {
                unScheduleMessage({ channelId });
                return;
            }
            const usergroupIds = usergroups.getUsergroupsForChannel(channelId);
            if (usergroupIds.length === 0) {
                const message = library.registrationList(
                    DateTime.now(),
                    registrations,
                    userCache.generateFullNameAndTag,
                );
                helper.postMessage(app, channelId, message);
            } else {
                usergroupIds.forEach(async (usergroupId) => {
                    const filteredRegistrations = registrations.filter(
                        (userId) => usergroups.isUserInUsergroup(userId, usergroupId),
                    );
                    const message = library.registrationListWithUsergroup(
                        DateTime.now(),
                        filteredRegistrations,
                        usergroups.generatePlaintextString(usergroupId),
                        userCache.generateFullNameAndTag,
                    );
                    helper.postMessage(app, channelId, message);
                });
            }
        });
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
    await service.getAllJobs().then((dbJobs) => {
        dbJobs.forEach((job) => {
            const channelId = job.channelId; // eslint-disable-line prefer-destructuring
            const time = job.time ? DateTime.fromSQL(job.time) : null;
            scheduleMessage({
                channelId, time, app, usergroups, userCache,
            });
        });
    });
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
