const { DateTime } = require("luxon");

const dfunc = require("./dateFunctions");
const helper = require("./helperFunctions");
const service = require("./databaseService");
const library = require("./responses");
const schedule = require("./scheduler/scheduler");

/**
 * An optional prefix for our slash-commands. When set to e.g. 'h',
 * '/listaa' becomes '/hlistaa'.
 * This requires manual command configuration on the Slack side of things,
 * as in you must alter the manifest for all the commands we have.
 */
const COMMAND_PREFIX = process.env.COMMAND_PREFIX ? process.env.COMMAND_PREFIX : "";

/**
 * Converts a string to an array of arguments. Drops all unnecessary whitespace in the process.
 *
 * @param {string} text - The text to turn into an array of arguments
 * @returns {Array.<string>} Args
 */
const argify = (text) => {
  if (!text) {
    return [];
  }
  return (
    text
      // replace all tabs with spaces
      .replaceAll("\t", " ")
      // turn into array
      .split(" ")
      // drop all 'empty' arguments
      .filter((str) => str.trim().length > 0)
  );
};

exports.enableSlashCommands = ({ app, usergroups }) => {
  /**
   * Checks if user gave 'help' as a parameter to a command.
   * If yes, posts instructions on how to use that command.
   * Returns true, if user asked for help and false otherwise.
   */
  const help = (input, channelId, userId, response) => {
    if (input.trim().toLowerCase() === "help") {
      helper.postEphemeralMessage(app, channelId, userId, response());
      return true;
    }
    return false;
  };

  /**
   * Checks if user gave at least as many parameters as was expected.
   * If yes, posts instructions on how to use that command.
   */
  const enoughParameters = (limit, parameterCount, channelId, userId, response) => {
    if (parameterCount >= limit) return true;
    helper.postEphemeralMessage(app, channelId, userId, response);
    return false;
  };

  /**
   * Listens to a slash-command and changes the time at which the automated message is posted to the current channel.
   */
  app.command(`/${COMMAND_PREFIX}tilaa`, async ({ command, ack }) => {
    try {
      await ack();
      const { text: input, channel_id: channelId, user_id: userId } = command;

      // print help before channel membership check
      if (help(input, channelId, userId, library.explainTilaa)) return;

      // check if bot is a member
      const isMember = await helper.isBotChannelMember(app, channelId);
      if (!isMember) {
        helper.postEphemeralMessage(
          app,
          channelId,
          userId,
          library.subscribeFailedNotInChannel(command.channel_name),
        );
        return;
      }
      const parameters = argify(input);
      const minParamN = 1;
      let response = library.demandTimeAndOffice();
      if (!enoughParameters(minParamN, parameters.length, channelId, userId, response)) {
        return;
      }
      const [timeString, officeName] = parameters;
      const office = officeName ? await service.getOfficeByName(officeName) : null;
      if (officeName && !office) {
        response = library.noOfficeFound(officeName);
        helper.postEphemeralMessage(app, channelId, userId, response);
        return;
      }
      const time = dfunc.parseTime(timeString);
      if (!time || !time.isValid) {
        response = library.demandTime();
        helper.postEphemeralMessage(app, channelId, userId, response);
        return;
      }

      schedule.scheduleMessage({
        channelId,
        time,
        officeId: office ? office.id : null,
        app,
        usergroups,
      });
      response = library.automatedMessageRescheduled(
        time.setLocale("fi").toLocaleString(DateTime.TIME_24_SIMPLE),
        office,
      );
      helper.postMessage(app, channelId, response);
    } catch (error) {
      console.log(error);
    }
  });
};
