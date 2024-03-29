import { Module } from "@nestjs/common";
import { UserModule } from "../entities/user/user.module";
import { UserService } from "../entities/user/user.service";
import { SyncController } from "./sync.controller";
import { SyncService } from "./sync.service";
import { UserSyncService } from "./user-sync.service";

@Module({
  imports: [UserModule],
  providers: [SyncService, UserSyncService, UserService],
  controllers: [SyncController],
  exports: [SyncService, UserSyncService],
})
export class SyncModule {}
