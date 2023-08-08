import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PresenceController } from "./presence.controller";
import { Presence } from "./presence.entity";
import { PresenceService } from "./presence.service";

@Module({
  imports: [TypeOrmModule.forFeature([Presence])],
  providers: [PresenceService],
  controllers: [PresenceController],
  exports: [TypeOrmModule],
})
export class PresenceModule {}
