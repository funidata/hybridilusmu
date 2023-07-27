import { Controller } from "@nestjs/common";
import BoltEvent from "../../bolt/decorators/bolt-event.decorator";

@Controller()
export class HomeTabController {
  @BoltEvent("app_home_opened")
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
                  text: "*Welcome controller, <@" + event.user + "> :house:*",
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
