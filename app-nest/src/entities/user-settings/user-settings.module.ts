import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserSettings } from "./user-settings.entity";
import { UserSettingsService } from "./user-settings.service";

@Module({
  imports: [TypeOrmModule.forFeature([UserSettings])],
  providers: [UserSettingsService],
  exports: [TypeOrmModule, UserSettingsService],
})
export class UserSettingsModule {}
