import { OmitType, PickType } from "@nestjs/swagger";
import { UserSettings } from "./user-settings.entity";

export class UpsertUserSettingsDto extends OmitType(UserSettings, [
  "visibleOffice",
  "user",
]) {}

export class SetVisibleOfficeDto extends PickType(UserSettings, [
  "userSlackId",
]) {
  visibleOfficeId: number;
}
