import { Controller } from "@nestjs/common";
import dayjs from "dayjs";
import BoltAction from "../../bolt/decorators/bolt-action.decorator";
import BoltActions from "../../bolt/enums/bolt-actions.enum";
import { BoltActionArgs } from "../../bolt/types/bolt-action-types";
import { PresenceService } from "./presence.service";

@Controller()
export class PresenceController {
  constructor(private presenceService: PresenceService) {}

  @BoltAction(BoltActions.REGISTER_PRESENCE)
  async registerPresence({ ack, body, payload }: BoltActionArgs) {
    await ack();
    const date = dayjs(payload["value"]).toDate();
    await this.presenceService.add({ userId: body.user.id, date });
  }
}
