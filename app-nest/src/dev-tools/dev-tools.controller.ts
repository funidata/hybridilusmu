import { Controller } from "@nestjs/common";
import BoltAction from "../bolt/decorators/bolt-action.decorator";
import { UserSyncService } from "../sync/user-sync.service";

@Controller()
export class DevToolsController {
  constructor(private userSyncService: UserSyncService) {}

  @BoltAction("sync_users")
  syncUsers() {
    return async ({ ack }) => {
      await ack();
      await this.userSyncService.syncUsers();
    };
  }
}
