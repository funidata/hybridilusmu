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
    * Checks if user gave 'help' as a parameter to a command.
    * If yes, posts instructions on how to use that command.
    * Returns true, if user asked for help and false otherwise.
    */
    const help = (input, channelId, userId, response) => {
        if (input.trim().toLowerCase() === 'help') {
            helper.postEphemeralMessage(app, channelId, userId, response());
            return true;
        }
        return false;
    };

    /**
    * Checks if user gave less parameters than was at least expected.
    * If yes, posts instructions on how to use that command.
    */
    const notEnoughParameters = (limit, parameterCount, channelId, userId, response) => {
        if (parameterCount < limit) {
            helper.postEphemeralMessage(app, channelId, userId, response());
            return true;
        }
        return false;
    };

    /**
    * Listens to a slash-command and lists users registered for the given day.
    */
    app.command(`/${COMMAND_PREFIX}listaa`, async ({ command, ack }) => {
        try {
            await ack();
            const input = command.text;
            const channelId = command.channel_id;
            const userId = command.user_id;
            if (help(input, channelId, userId, library.explainListaa)) return;
            const date = dfunc.parseDate(input, DateTime.now());
            if (date.isValid) {
                const registrations = await service.getRegistrationsFor(date.toISODate());
                helper.postEphemeralMessage(app, channelId, userId, library.registrationList(date, registrations));
            } else {
                helper.postEphemeralMessage(app, channelId, userId, library.demandDate());
            }
        } catch (error) {
            console.log('Tapahtui virhe :(');
            console.log(error);
        }
    });

    /**
    * Listens to a slash-command and registers user for given day.
    * Handles both normal and default registrations.
    */
    app.command(`/${COMMAND_PREFIX}ilmoita`, async ({ command, ack }) => {
        try {
            await ack();
            const input = command.text;
            const channelId = command.channel_id;
            const userId = command.user_id;
            if (help(input, channelId, userId, library.explainIlmoita)) return;
            let response = library.demandDateAndStatus();
            const parameters = input.split(' ');
            if (notEnoughParameters(2, parameters.length, channelId, userId, library.demandDateAndStatus)) return;
            let dateString = parameters[0];
            let status = parameters[1];
            let devault = false;
            if (parameters[0].toLowerCase() === 'def' && parameters.length === 3) {
                [dateString, status, devault] = [parameters[1], parameters[2], true];
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
            helper.postEphemeralMessage(app, channelId, userId, response);
        } catch (error) {
            console.log('Tapahtui virhe :(');
            console.log(error);
        }
    });

    /**
    * Listens to a slash-command and removes registration for user for the given day.
    * Handles both normal and default registration removals.
    */
    app.command(`/${COMMAND_PREFIX}poista`, async ({ command, ack }) => {
        try {
            await ack();
            const input = command.text;
            const channelId = command.channel_id;
            const userId = command.user_id;
            if (help(input, channelId, userId, library.explainPoista)) return;
            let response = library.demandDate();
            const parameters = input.split(' ');
            if (notEnoughParameters(1, parameters.length, channelId, userId, library.demandDate)) return;
            let dateString = parameters[0];
            let devault = false;
            if (parameters[0].toLowerCase() === 'def' && parameters.length === 2) {
                [dateString, devault] = [parameters[1], true];
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
            helper.postEphemeralMessage(app, channelId, userId, response);
        } catch (error) {
            console.log('Tapahtui virhe :(');
            console.log(error);
        }
    });
};
