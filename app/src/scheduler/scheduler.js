const { DateTime } = require("luxon");

const schedule = require("node-schedule");
const service = require("../databaseService");
const helper = require("../helperFunctions");
const { sendScheduledMessage } = require("../scheduler/scheduledMessage");

// Node-Schedule Job Objects
const jobs = new Map();

/**
 * Removes the given channel from the database's Job table
 * and cancels the job from the node-schedule jobs map.
 * @param {string} channelId - ID of the channel we want to unschedule
 */
async function unScheduleMessage(channelId) {
  const foundJob = jobs.get(channelId);
  if (foundJob) {
    service.removeJob(channelId);
    foundJob.cancel();
    console.log("unscheduled from", channelId);
  }
}

/**
 * Schedules a job to send a daily message to the given channel at the given or default time.
 * Creates or updates both entires in both the Map and the database.
 * @param {String} channelId
 * @param {DateTime} time Optional. Only the time part is used.
 * @param {Object} [office] Optional office filter.
 * @param app Optional. Needed only when creating a job.
 * @param usergroups Optional. Needed only when creating a job.
 */
async function scheduleMessage({ channelId, time, officeId, app, usergroups }) {
  const rule = new schedule.RecurrenceRule();
  const sendMessage = () => sendScheduledMessage(app, channelId, officeId, usergroups);

  rule.tz = "Europe/Helsinki";
  rule.dayOfWeek = [1, 2, 3, 4, 5];
  rule.hour = time ? time.hour : 6; // use given or default time
  rule.minute = time ? time.minute : 0;
  // rule.second = [0, 15, 30, 45]; // for testing
  // rule.second = time ? time.hour : 1; // also for testing
  const foundJob = jobs.get(channelId);
  if (foundJob) {
    // update db with new time & delete outdated job from jobs map
    await service.addJob(channelId, time ? time.toSQLTime() : null, officeId);
    foundJob.cancel();
    jobs.delete(channelId);
  }
  // create job
  // 1st arg: when to execute, 2nd arg: what to execute
  const job = schedule.scheduleJob(rule, sendMessage);
  // add the job to the map so that we can update it later
  jobs.set(channelId, job);
}

/**
 * Schedules jobs to send a daily message to every channel the bot is a member of.
 */
async function startScheduling({ app, usergroups }) {
  let channels = await helper.getMemberChannelIds(app);
  channels = channels.map((channel) => ({
    channel_id: channel,
  }));
  await service.updateJobs(channels); // update the database to include channels the bot is a member of
  console.log("Scheduling every Job found in the database");
  const allJobs = await service.getAllJobs();
  await Promise.all(
    allJobs.map((job) => {
      const channelId = job.channelId;
      const time = job.time ? DateTime.fromSQL(job.time) : null;
      const officeId = job.officeId;
      return scheduleMessage({ channelId, time, officeId, app, usergroups });
    }),
  );
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
  everyNight.tz = "Etc/UTC";
  everyNight.hour = 0;
  everyNight.minute = 25;
  console.log(
    `scheduling nightly usergroup reads at ${everyNight.hour}h ${everyNight.minute}m (${everyNight.tz})`,
  );
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
