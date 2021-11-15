const home = require('./home');

exports.enableEventListeners = function (app) {
    /**
    * Updates the App-Home page for the specified user when they click on the Home tab.
    */
    app.event('app_home_opened', async ({ event, client }) => {
        home.update(client, event.user);
    });
};
