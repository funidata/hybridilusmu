import { Module } from "@nestjs/common";
import { SyncService } from "./sync.service";
import { UserSyncService } from "./user-sync.service";

@Module({ providers: [SyncService, UserSyncService] })
export class SyncModule {}
