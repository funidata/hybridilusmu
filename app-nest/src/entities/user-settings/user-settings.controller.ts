import { Controller } from "@nestjs/common";
import BoltAction from "../../bolt/decorators/bolt-action.decorator";
import BoltActions from "../../bolt/enums/bolt-actions.enum";
import { BoltActionArgs } from "../../bolt/types/bolt-action-types";
import { UserSettingsService } from "./user-settings.service";

@Controller()
export class UserSettingsController {
  constructor(private userSettingsService: UserSettingsService) {}

  @BoltAction(BoltActions.SET_VISIBLE_OFFICE)
  async setVisibleOffice({ ack, payload, body }: BoltActionArgs) {
    await ack();
    const visibleOfficeId = Number(payload["selected_option"].value);
    await this.userSettingsService.setVisibleOffice({
      userSlackId: body.user.id,
      visibleOfficeId,
    });
  }
}
