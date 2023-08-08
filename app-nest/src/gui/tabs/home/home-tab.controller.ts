import { Controller } from "@nestjs/common";
import BoltEvent from "../../../bolt/decorators/bolt-event.decorator";
import BoltEvents from "../../../bolt/enums/bolt-events.enum";
import { AppHomeOpenedArgs } from "../../../bolt/types/bolt-event-types";
import { UserService } from "../../../entities/user/user.service";
import getDayListBlocks from "./day-list.blocks";
import getHomeTabBlocks from "./home-tab.view";

@Controller()
export class HomeTabController {
  constructor(private userService: UserService) {}

  @BoltEvent(BoltEvents.APP_HOME_OPENED)
  async getView({ event, client, logger }: AppHomeOpenedArgs) {
    const users = await this.userService.findAll();
    const { slackId } = users[0];
    getDayListBlocks();

    try {
      const result = await client.views.publish({
        user_id: event.user,
        view: {
          type: "home",
          blocks: getHomeTabBlocks(),
        },
      });

      logger.debug(result);
    } catch (error) {
      logger.error(error);
    }
  }
}
