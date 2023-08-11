import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  SetVisibleOfficeDto,
  UpsertUserSettingsDto,
} from "./user-settings.dto";
import { UserSettings, UserSettingsRepository } from "./user-settings.entity";

@Injectable()
export class UserSettingsService {
  constructor(
    @InjectRepository(UserSettings)
    private userSettingsRepository: UserSettingsRepository,
  ) {}

  async upsert(input: UpsertUserSettingsDto) {
    return await this.userSettingsRepository.upsert(input, ["userSlackId"]);
  }

  async setVisibleOffice({
    userSlackId,
    visibleOfficeId,
  }: SetVisibleOfficeDto) {
    await this.upsert({ userSlackId });
    return this.userSettingsRepository.update(
      { userSlackId },
      { visibleOffice: { id: visibleOfficeId } },
    );
  }
}
