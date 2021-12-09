const { DateTime } = require('luxon');

const schedule = require('node-schedule');
const service = require('./databaseService');
const helper = require('./helperFunctions');
const library = require('./responses');

const jobs = new Map();

async function scheduleMessage({
    channelId, hour = 4, app, usergroups, // TODO: minutes
}) {
    /*
    TODO:
    populate the db table with all channels the bot is a member of
    add listener that responds when the bot is added to a new channel by calling a function that schedules a new job

    change the model name to ChannelJob or AutomatedMessage? or add a job id and make it pk instead of channel_id?
    change tz to Helsinki and default hour to 6 AM
    rename startScheduling to something like scheduleAllMessages
    change the name of this file to something like schedule

    additional feature:
    configure the default time with a slash-command.
    save it to the db with either a special entry in the Job table (sketchy) or a dedicated settings table
    */
    // update the job's db representation to the given time

    // schedule the job to the given or default time
    const rule = new schedule.RecurrenceRule();
    rule.tz = 'Etc/UTC';
    rule.dayOfWeek = [1, 2, 3, 4, 5];
    // rule.hour = hour;
    // rule.minute = 0;
    rule.second = [0, 15, 30, 45];

    // console.log(rule);

    // find the job by the given channel id
    const foundJob = jobs.get(channelId);

    // console.log(foundJob);

    if (foundJob) {
        service.addJob(channelId, hour); // only when updating
        foundJob.reschedule(rule);
    } else {
        const job = schedule.scheduleJob(rule, async () => {
            const registrations = await service.getRegistrationsFor(DateTime.now().toISODate());
            const usergroupIds = await usergroups.getUsergroupsForChannel(channelId);
            if (usergroupIds.length === 0) {
                const message = library.registrationList(
                    DateTime.now(),
                    registrations,
                );
                // console.log(channelId);
                helper.postMessage(app, channelId, message);
            } else {
                usergroupIds.forEach(async (usergroupId) => {
                    const message = library.registrationListWithUsergroup(
                        DateTime.now(),
                        registrations.filter(
                            (userId) => usergroups.isUserInUsergroup(userId, usergroupId),
                        ),
                        usergroups.generateMentionString(usergroupId),
                    );
                    // console.log(channelId);
                    helper.postMessage(app, channelId, message);
                });
            }
        });
        // add the job to the map so that we can reschedule it later
        jobs.set(channelId, job);

        console.log(job);
    }
}

/**
* Sends a scheduled message every weekday to all the channels the bot is in.
*/
async function startScheduling({ app, usergroups }) {
    let channels = await helper.getMemberChannelIds(app);
    // console.log(channels);
    channels = channels.map((channel) => ({
        channel_id: channel,
    }));
    // console.log(channels);
    await service.addAllJobs(channels); // add all those channels that are not in the db yet

    // console.log('Scheduling daily posts to every public channel the bot is a member of');
    console.log('Scheduling every Job found in the db');
    await service.getAllJobs().then((dbJobs) => {
        // console.log(dbJobs);

        dbJobs.forEach(((job) => {
            // console.log(job);
            const { channelId } = job;
            const hour = job.time || 4; // will not work when not hour
            // console.log(channelId);
            scheduleMessage({
                channelId, hour, app, usergroups,
            });
        }));
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
    startScheduling,
    scheduleMessage,
    scheduleUsergroupReadings,
};
