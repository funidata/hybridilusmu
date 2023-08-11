import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OfficeModule } from "../office/office.module";
import { PresenceController } from "./presence.controller";
import { Presence } from "./presence.entity";
import { PresenceService } from "./presence.service";

@Module({
  imports: [TypeOrmModule.forFeature([Presence]), OfficeModule],
  providers: [PresenceService],
  controllers: [PresenceController],
  exports: [TypeOrmModule],
})
export class PresenceModule {}
