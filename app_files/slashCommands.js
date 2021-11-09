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

exports.enableSlashCommands = function (app) {
    /**
    * Listens to a slash-command and prints a list of people at the office on the given day.
    */
    app.command(`/${COMMAND_PREFIX}listaa`, async ({ command, ack }) => {
        try {
            await ack();
            const parameter = command.text; // Antaa käskyn parametrin
            const date = dfunc.parseDate(parameter, DateTime.now());
            if (date.isValid) {
                const registrations = await service.getRegistrationsFor(date.toISODate());
                let response = `${dfunc.atWeekday(date)} toimistolla `;
                if (registrations.length === 0) response = `Kukaan ei ole toimistolla ${dfunc.atWeekday(date).toLowerCase()}`;
                else if (registrations.length === 1) response += 'on:\n';
                else response += 'ovat:\n';
                registrations.forEach((user) => {
                    response += `<@${user}>\n`;
                });
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
