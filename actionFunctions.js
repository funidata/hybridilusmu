const home = require('./home');
const service = require('./databaseService');

exports.enableActionFunctions = function (app) {
    
    /**
    * Updates the App-Home page for the specified user.
    */
    app.action('update_click', async ({ body, ack, client }) => {
        home.update(client, body.user.id);
        await ack();
    });
    
    /**
    * Registers the user as present at the office for the selected day and updates the App-Home page.
    */
    app.action('office_click', async ({ body, ack, client }) => {
        const data = JSON.parse(body.actions[0].value);
        await service.changeRegistration(body.user.id, data.date, !data.atOffice);
        home.update(client, body.user.id);
        await ack();
    });

    /**
    * Registers the user as not present at the office for the selected day
    * and updates the App-Home page.
    */
    app.action('remote_click', async ({ body, ack, client }) => {
        const data = JSON.parse(body.actions[0].value);
        await service.changeRegistration(body.user.id, data.date, !data.isRemote, false);
        home.update(client, body.user.id);
        await ack();
    });

    /**
    * Registers the user as present at the office by default for the selected day
    * and updates the App-Home page.
    */
    app.action('default_office_click', async ({ body, ack, client }) => {
        const data = JSON.parse(body.actions[0].value);
        await service.changeDefaultRegistration(body.user.id, data.weekday, !data.defaultAtOffice);
        home.update(client, body.user.id);
        await ack();
    });

    /**
    * Registers the user as not present at the office by default for the selected day
    * and updates the App-Home page.
    */
    app.action('default_remote_click', async ({ body, ack, client }) => {
        const data = JSON.parse(body.actions[0].value);
        await service.changeDefaultRegistration(body.user.id, data.weekday,
            !data.defaultIsRemote, false);
        home.update(client, body.user.id);
        await ack();
    });
    
};
