import { Controller } from "@nestjs/common";
import BoltAction from "../bolt/decorators/bolt-action.decorator";
import BoltActions from "../bolt/enums/bolt-actions.enum";
import { UserSyncService } from "../sync/user-sync.service";

@Controller()
export class DevToolsController {
  constructor(private userSyncService: UserSyncService) {}

  @BoltAction(BoltActions.SYNC_USERS)
  async syncUsers({ ack }) {
    await ack();
    await this.userSyncService.syncUsers();
  }
}
