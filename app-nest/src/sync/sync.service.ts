import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { UserSyncService } from "./user-sync.service";

@Injectable()
export class SyncService implements OnApplicationBootstrap {
  constructor(private userSyncService: UserSyncService) {}
  async onApplicationBootstrap() {
    console.log("app bootstrap");
    await this.userSyncService.syncUsers();
  }
}
