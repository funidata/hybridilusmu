import { Controller } from "@nestjs/common";
import BoltEvent from "../bolt/decorators/bolt-event.decorator";
import BoltEvents from "../bolt/enums/bolt-events.enum";
import { UserSyncService } from "./user-sync.service";

@Controller()
export class SyncController {
  constructor(private userSyncService: UserSyncService) {}

  @BoltEvent(BoltEvents.USER_PROFILE_CHANGED)
  async userProfileChanged({ event }) {
    await this.userSyncService.syncUsers(event.user);
  }
}
