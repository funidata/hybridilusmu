import { Module } from "@nestjs/common";
import { UserModule } from "../entities/user/user.module";
import { UserService } from "../entities/user/user.service";
import { HomeTabController } from "./tabs/home/home-tab.controller";

@Module({
  imports: [UserModule],
  providers: [UserService],
  controllers: [HomeTabController],
})
export class GuiModule {}
