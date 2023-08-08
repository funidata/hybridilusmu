import { Controller } from "@nestjs/common";
import BoltEvent from "../bolt/decorators/bolt-event.decorator";
import { UserSyncService } from "./user-sync.service";

@Controller()
export class SyncController {
  constructor(private userSyncService: UserSyncService) {}

  @BoltEvent("user_profile_changed")
  async userProfileChanged({ event }) {
    await this.userSyncService.syncUsers(event.user);
  }
}
