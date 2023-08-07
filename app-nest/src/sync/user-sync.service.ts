import { Injectable, Logger } from "@nestjs/common";
import { UsersListResponse } from "@slack/web-api";
import { BoltUserService } from "../bolt/bolt-user.service";
import { UserService } from "../entities/user/user.service";

type SlackMember = UsersListResponse["members"][0];

@Injectable()
export class UserSyncService {
  private logger = new Logger(UserSyncService.name);

  constructor(
    private boltUserService: BoltUserService,
    private userService: UserService,
  ) {}

  /**
   * Synchronize users from Slack to local database.
   *
   * By default, all users are synchronized. Optionally, a single user may be
   * updated by passing their data as `updateOverride` argument.
   */
  async syncUsers(updateOverride?: SlackMember) {
    if (updateOverride) {
      this.logger.log(
        `Starting user data synchronization for user ${updateOverride.id}.`,
      );
    } else {
      this.logger.log("Starting user data synchronization for all users.");
    }

    const slackUsers = updateOverride
      ? [updateOverride]
      : (await this.boltUserService.getUsers()).members;

    const users = slackUsers.filter(this.appUserFilter).map((user) => ({
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
  private appUserFilter(user: SlackMember) {
    return (
      user.id !== "USLACKBOT" &&
      !user.is_bot &&
      !user.is_restricted &&
      !user.is_ultra_restricted &&
      !user.deleted
    );
  }
}
