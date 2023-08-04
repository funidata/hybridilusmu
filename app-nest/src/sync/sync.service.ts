import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { inDevelopmentEnvironment } from "../config/utils";
import { UserSyncService } from "./user-sync.service";

@Injectable()
export class SyncService implements OnApplicationBootstrap {
  constructor(private userSyncService: UserSyncService) {}

  async onApplicationBootstrap() {
    if (!inDevelopmentEnvironment) {
      await this.userSyncService.syncUsers();
    }
  }
}
