import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserSettings, UserSettingsRepository } from "./user-settings.entity";

@Injectable()
export class UserSettingsService {
  constructor(
    @InjectRepository(UserSettings)
    private userSettingsRepository: UserSettingsRepository,
  ) {}
}
