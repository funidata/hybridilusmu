import { Controller } from "@nestjs/common";
import BoltEvent from "../../bolt/decorators/bolt-event.decorator";
import BoltEvents from "../../bolt/enums/bolt-events.enum";
import { UserService } from "../../entities/user/user.service";
import devTools from "../dev/dev-tools";

@Controller()
export class HomeTabController {
  constructor(private userService: UserService) {}

  @BoltEvent(BoltEvents.APP_HOME_OPENED)
  async getView({ event, client, logger }) {
    const users = await this.userService.findAll();
    const { slackId } = users[0];

    try {
      const result = await client.views.publish({
        user_id: event.user,
        view: {
          type: "home",
          blocks: [
            ...devTools,
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text:
                  "*Welcome controller, <@" +
                  event.user +
                  "> :house:* " +
                  slackId,
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
  }
}
