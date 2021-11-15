const { DateTime } = require('luxon');

const service = require('./databaseService');
const dfunc = require('./dateFunctions');
const helper = require('./helperFunctions');
const library = require('./responses');

/**
 * An optional prefix for our slash-commands. When set to e.g. 'h',
 * '/listaa' becomes '/hlistaa'.
 * This requires manual command configuration on the Slack side of things,
 * as in you must alter the manifest for all the commands we have.
 */
const COMMAND_PREFIX = process.env.COMMAND_PREFIX ? process.env.COMMAND_PREFIX : '';

exports.enableSlashCommands = function (app) {
    /**
    * Listens to a slash-command and signs user up for given day. 
    * Handles both normal and default registrations.
    */
    app.command(`/${COMMAND_PREFIX}poista`, async ({ command, ack }) => {
        try {
            await ack();
            const userId = command.user_id;
            let response = library.demandDate();
            const parameters = command.text.split(' ');
            if (parameters.length === 0) {
                helper.postEphemeralMessage(app, command.channel_id, userId, response);
                return;
            }
            let dateString = parameters[0];
            let devault = false;
            if (parameters.length === 2 && parameters[0] === 'def') {
                devault = true;
                dateString = parameters[1];
            }
            const date = dfunc.parseDate(dateString, DateTime.now());
            if (date.isValid) {
                if (devault) {
                    await service.changeDefaultRegistration(userId, dfunc.getWeekday(date), false);
                    response = library.defaultRegistrationRemoved(date);
                } else {
                    await service.changeRegistration(userId, date.toISODate(), false);
                    response = library.normalRegistrationRemoved(date);
                }
            }
            helper.postEphemeralMessage(app, command.channel_id, userId, response);
        } catch (error) {
            console.log('Tapahtui virhe :(');
            console.log(error);
        }
    });

    /**
    * Listens to a slash-command and signs user up for given day.
    */
    app.command(`/${COMMAND_PREFIX}ilmoita`, async ({ command, ack }) => {
        try {
            await ack();
            const userId = command.user_id;
            let response = library.demandDateAndStatus();
            const parameters = command.text.split(' ');
            if (parameters.length < 2) {
                helper.postEphemeralMessage(app, command.channel_id, userId, response);
                return;
            }
            let dateString = parameters[0];
            let status = parameters[1];
            let devault = false;
            if (parameters.length === 3 && parameters[0] === 'def') {
                dateString = parameters[1];
                status = parameters[2];
                devault = true;
            }
            const date = dfunc.parseDate(dateString, DateTime.now());
            if (dfunc.isWeekday(date) && (status === 'toimisto' || status === 'etä')) {
                if (devault) {
                    await service.changeDefaultRegistration(userId, dfunc.getWeekday(date), true, status === 'toimisto');
                    response = library.defaultRegistrationAdded(date, status);
                } else {
                    await service.changeRegistration(userId, date.toISODate(), true, status === 'toimisto');
                    response = library.normalRegistrationAdded(date, status);
                }
            } else if (dfunc.isWeekend(date)) {
                if (devault) response = library.denyDefaultRegistrationForWeekend();
                else response = library.denyNormalRegistrationForWeekend();
            }
            helper.postEphemeralMessage(app, command.channel_id, userId, response);
        } catch (error) {
            console.log('Tapahtui virhe :(');
            console.log(error);
        }
    });

    app.command(`/${COMMAND_PREFIX}listaa`, async ({ command, ack }) => {
        try {
            await ack();
            const parameter = command.text;
            if (parameter.trim().toLowerCase() === 'help') {
                helper.postEphemeralMessage(app, command.channel_id, command.user_id, library.explainListaa());
                return;
            }
            const date = dfunc.parseDate(parameter, DateTime.now());
            if (date.isValid) {
                const registrations = await service.getRegistrationsFor(date.toISODate());
                helper.postEphemeralMessage(app, command.channel_id, command.user_id, library.registrationList(date, registrations));
            } else {
                helper.postEphemeralMessage(app, command.channel_id, command.user_id, library.demandDate());
            }
        } catch (error) {
            console.log('Tapahtui virhe :(');
            console.log(error);
        }
    });
};
