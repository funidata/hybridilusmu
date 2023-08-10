import { Module } from "@nestjs/common";
import { OfficeModule } from "./office/office.module";
import { PresenceModule } from "./presence/presence.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [UserModule, PresenceModule, OfficeModule],
})
export class EntitiesModule {}
