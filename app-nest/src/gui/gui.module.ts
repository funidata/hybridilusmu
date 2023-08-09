import { Module } from "@nestjs/common";
import { HomeTabModule } from "./tabs/home/home-tab.module";

@Module({
  imports: [HomeTabModule],
})
export class GuiModule {}
