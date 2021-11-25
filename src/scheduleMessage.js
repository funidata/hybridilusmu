const { DateTime } = require('luxon');

const schedule = require('node-schedule');
const service = require('./databaseService');
const helper = require('./helperFunctions');
const library = require('./responses');

const jobs = new Map();

/**
* Sends a scheduled message every weekday to all the channels the bot is in.
*/
async function startScheduling({ app, usergroups }) {
    

    // TODO now
    // modify controllers, db and service to accommodate everything here
    // create the slash command to use the rescheduling function
    // message posting

    // TODO later
    // populate the db table with all channels the bot is a member of
    // add middleware that responds when the bot is added to a new channel by calling a function that schedules a new job

    // TODO last
    // change tz to Helsinki and default hour to 6 AM
    // change the name of this function to something like scheduleAllMessages
    // change the name of this file to something like schedule


    // iterate through the jobs in the db
    service.getJobs().forEach(function(hour, channelId){
        // set the specified time or default
        const rule = new schedule.RecurrenceRule();
        rule.tz = 'Etc/UTC';
        rule.dayOfWeek = [1, 2, 3, 4, 5];
        rule.hour = hour === null ? 4 : hour;
        rule.minute = 0;

        // create and schedule a job for each
        const job = schedule.scheduleJob(rule, function(){
            // post message to the given channelId like below

        });
        // add the job to the map so that we can reschedule it later
        jobs.set(channelId, job)
    })



    



    const rule = new schedule.RecurrenceRule();
    rule.tz = 'Etc/UTC';
    rule.dayOfWeek = [1, 2, 3, 4, 5];
    rule.hour = 4;
    rule.minute = 0;
    // rule.second = [0, 15, 30, 45];
    console.log('Scheduling posts to every public channel the bot is a member of every weekday at hour', rule.hour, rule.tz);
    schedule.scheduleJob(rule, async () => {
        const registrations = await service.getRegistrationsFor(DateTime.now().toISODate());
        const channels = await helper.getMemberChannelIds(app);
        usergroups.getUsergroupsForChannels(channels).forEach(async (obj) => {
            if (obj.usergroup_ids.length === 0) {
                const message = library.registrationList(
                    DateTime.now(),
                    registrations,
                );
                helper.postMessage(app, obj.channel_id, message);
            } else {
                obj.usergroup_ids.forEach(async (usergroupId) => {
                    const message = library.registrationListWithUsergroup(
                        DateTime.now(),
                        registrations.filter(
                            (userId) => usergroups.isUserInUsergroup(userId, usergroupId),
                        ),
                        usergroups.generateMentionString(usergroupId),
                    );
                    helper.postMessage(app, obj.channel_id, message);
                });
            }
        });
    });
}

async function scheduleMessage({ channelId, hour }) {

    // update the job's db representation to the given time
    service.setJob(channelId, hour)

    // schedule the job to the given time
    const rule = new schedule.RecurrenceRule();
    rule.tz = 'Etc/UTC';
    rule.dayOfWeek = [1, 2, 3, 4, 5];
    rule.hour = hour;
    rule.minute = 0;

    // find the job by the given channel_id
    const job = jobs.get(channelId)

    if (job) {
        job.reschedule(rule)
    } else {
        job = schedule.scheduleJob(rule, function(){
            // post message to the given channelId like above

        });
    }
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
    scheduleUsergroupReadings
};
