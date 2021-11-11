const { DateTime } = require('luxon');

const service = require('./databaseService');
const dfunc = require('./dateFunctions');
const helper = require('./helperFunctions');

/**
 * An optional prefix for our slash-commands. When set to e.g. 'h',
 * '/listaa' becomes '/hlistaa'.
 * This requires manual command configuration on the Slack side of things,
 * as in you must alter the manifest for all the commands we have.
 */
const COMMAND_PREFIX = process.env.COMMAND_PREFIX ? process.env.COMMAND_PREFIX : '';

exports.enableSlashCommands = function ({ app, usergroups }) {
    /**
     * Generates a listing message for a given date
     * @param {string} date An ISO-8601 date string. If null:
     *  - please provide data via fetchedRegistrations
     *  - we'll also use a "today" string for rendering
     * @param {string} slackUsergroupId A Slack usergroup id, if any.
     * @param {*} fetchedRegistrations A ready set of registration data for perfomance reasons
     * @return {string} A message ready to post
     */
    const generateListMessage = async (
        date,
        slackUsergroupId = null,
        fetchedRegistrations = null,
    ) => {
        const usergroupFilter = !slackUsergroupId
            ? () => true
            : (uid) => usergroups.isUserInUsergroup(uid, slackUsergroupId);
        const registrations = fetchedRegistrations || (
            await service.getRegistrationsFor(date)
        ).filter(usergroupFilter);
        const specifier = !slackUsergroupId
            ? ''
            : ` tiimistä ${usergroups.generateMentionString(slackUsergroupId)}`;
        const predicate = registrations.length === 1 ? 'on' : 'ovat';
        const dateInResponse = date
            ? dfunc.atWeekday(DateTime.fromISO(date))
            : 'Tänään';
        let response = !slackUsergroupId
            ? `${dateInResponse} toimistolla ${predicate}:`
            : `${dateInResponse}${specifier} ${predicate} toimistolla:`;
        if (registrations.length === 0) {
            response = `Kukaan${specifier} ei ole toimistolla ${dateInResponse.toLowerCase()}`;
        }
        response += '\n';
        registrations.forEach((user) => {
            response += `<@${user}>\n`;
        });
        return response;
    };

    /**
     * Listens to a slash-command and prints a list of people at the office on the given day.
     */
    app.command(`/${COMMAND_PREFIX}listaa`, async ({ command, ack }) => {
        try {
            await ack();
            let error = false;
            // Antaa käskyn parametrin, eli kaiken mitä tulee slash-komennon ja ensimmäisen
            // välilyönnin jälkeen
            const parameter = command.text;
            const args = parameter.replaceAll('\t', ' ').split(' ').filter((str) => str.trim().length > 0);
            if (args.length === 0) {
                args.push('tänään');
            } else if (args.length === 1) {
                if (usergroups.parseMentionString(args[0]) !== false) {
                    args.push('tänään');
                    args.reverse();
                }
            } else if (args.length > 2) {
                error = true;
            }
            if (args.length === 2 && usergroups.parseMentionString(args[0]) !== false) {
                args.reverse();
            }
            const date = dfunc.parseDate(args[0], DateTime.now());
            const usergroupId = args.length === 2 ? usergroups.parseMentionString(args[1]) : null;
            if (usergroupId === false) {
                error = true;
            }
            if (!error && date.isValid) {
                const response = await generateListMessage(date.toISODate(), usergroupId);
                helper.postEphemeralMessage(app, command.channel_id, command.user_id, response);
            } else {
                helper.postEphemeralMessage(app, command.channel_id, command.user_id, 'Anteeksi, en ymmärtänyt äskeistä.');
            }
        } catch (error) {
            console.log('Tapahtui virhe :(');
            console.log(error);
        }
    });

    // Tänne tulisi sitten lisää slash-komentoja jatkoksi
};
