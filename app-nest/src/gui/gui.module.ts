import { Module, OnModuleInit } from "@nestjs/common";
import { BoltService } from "../bolt/bolt.service";
import { HomeTabService } from "./tabs/home-tab.service";

@Module({
  providers: [HomeTabService],
})
export class GuiModule implements OnModuleInit {
  constructor(
    private boltService: BoltService,
    private homeTabService: HomeTabService,
  ) {}
  onModuleInit() {
    this.boltService.registerEventHandler(
      "app_home_opened",
      this.homeTabService.getView(),
    );
  }
}
