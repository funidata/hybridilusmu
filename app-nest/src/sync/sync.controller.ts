import { Controller } from "@nestjs/common";
import BoltEvent from "../bolt/decorators/bolt-event.decorator";
import BoltEvents from "../bolt/enums/bolt-events.enum";
import { UserProfileChangedArgs } from "../bolt/types/bolt-event-types";
import { UserSyncService } from "./user-sync.service";

@Controller()
export class SyncController {
  constructor(private userSyncService: UserSyncService) {}

  @BoltEvent(BoltEvents.USER_PROFILE_CHANGED)
  async userProfileChanged({ event }: UserProfileChangedArgs) {
    await this.userSyncService.syncUsers(event.user);
  }
}
