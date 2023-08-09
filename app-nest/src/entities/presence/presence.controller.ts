import { Controller } from "@nestjs/common";
import dayjs from "dayjs";
import BoltAction from "../../bolt/decorators/bolt-action.decorator";
import BoltActions from "../../bolt/enums/bolt-actions.enum";
import { BoltActionArgs } from "../../bolt/types/bolt-action-types";
import { PresenceType } from "./presence.entity";
import { PresenceService } from "./presence.service";

@Controller()
export class PresenceController {
  constructor(private presenceService: PresenceService) {}

  @BoltAction(BoltActions.SET_OFFICE_PRESENCE)
  async setOfficePresence({ ack, body, payload }: BoltActionArgs) {
    await ack();
    const date = dayjs(payload["value"]).toDate();
    await this.presenceService.upsert({
      userId: body.user.id,
      type: PresenceType.AT_OFFICE,
      date,
    });
  }

  @BoltAction(BoltActions.SET_REMOTE_PRESENCE)
  async setRemotePresence({ ack, body, payload }: BoltActionArgs) {
    await ack();
    const date = dayjs(payload["value"]).toDate();
    await this.presenceService.upsert({
      userId: body.user.id,
      type: PresenceType.REMOTE,
      date,
    });
  }

  @BoltAction(BoltActions.SELECT_OFFICE_FOR_DATE)
  async selectOfficeForDate({ ack, body, payload }: BoltActionArgs) {
    await ack();
    const { value, date } = JSON.parse(payload["selected_option"].value);
    await this.presenceService.upsert({
      userId: body.user.id,
      date: dayjs(date).toDate(),
      office: value,
    });
  }
}
