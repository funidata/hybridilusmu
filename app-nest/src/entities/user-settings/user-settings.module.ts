import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserSettingsController } from "./user-settings.controller";
import { UserSettings } from "./user-settings.entity";
import { UserSettingsService } from "./user-settings.service";

@Module({
  imports: [TypeOrmModule.forFeature([UserSettings])],
  providers: [UserSettingsService],
  controllers: [UserSettingsController],
  exports: [TypeOrmModule, UserSettingsService],
})
export class UserSettingsModule {}
