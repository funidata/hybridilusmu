import { Injectable } from "@nestjs/common";

@Injectable()
export class HomeTabService {
  getView() {
    return async ({ event, client, logger }) => {
      try {
        const result = await client.views.publish({
          user_id: event.user,
          view: {
            type: "home",
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: "*Welcome homeee, <@" + event.user + "> :house:*",
                },
              },
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: "Learn how home tabs can be more useful and interactive <https://api.slack.com/surfaces/tabs/using|*in the documentation*>.",
                },
              },
            ],
          },
        });

        logger.debug(result);
      } catch (error) {
        logger.error(error);
      }
    };
  }
}
