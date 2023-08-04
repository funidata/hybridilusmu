import { Injectable, Logger } from "@nestjs/common";
import { UsersListResponse } from "@slack/web-api";
import { BoltUserService } from "../bolt/bolt-user.service";
import { UserService } from "../entities/user/user.service";

@Injectable()
export class UserSyncService {
  private logger = new Logger(UserSyncService.name);

  constructor(
    private boltUserService: BoltUserService,
    private userService: UserService,
  ) {}

  async syncUsers() {
    this.logger.log("Starting user data synchronization.");
    const data = await this.boltUserService.getUsers();

    const users = data.members.filter(this.appUserFilter).map((user) => ({
      slackId: user.id,
      displayName: user.profile.display_name || "",
      realName: user.profile.real_name || "",
    }));

    await this.userService.upsert(users);
    this.logger.log("User data synchronized.");
  }

  /**
   * Filter out bots, restricted and deleted users, leaving only real app users.
   */
  private appUserFilter(user: UsersListResponse["members"][0]) {
    return (
      user.id !== "USLACKBOT" &&
      !user.is_bot &&
      !user.is_restricted &&
      !user.is_ultra_restricted &&
      !user.deleted
    );
  }
}
