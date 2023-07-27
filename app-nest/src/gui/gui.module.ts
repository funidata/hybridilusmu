import { Module } from "@nestjs/common";
import { HomeTabController } from "./tabs/home-tab.controller";

@Module({
  controllers: [HomeTabController],
})
export class GuiModule {}
