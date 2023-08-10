import { Module } from "@nestjs/common";
import { OfficeModule } from "../../../entities/office/office.module";
import { DevToolsModule } from "../../dev/dev-tools.module";
import { DayListItemBuilder } from "./day-list-item.builder";
import { DayListBuilder } from "./day-list.builder";
import { HomeTabBuilder } from "./home-tab.builder";
import { HomeTabController } from "./home-tab.controller";

@Module({
  imports: [DevToolsModule, OfficeModule],
  providers: [HomeTabBuilder, DayListBuilder, DayListItemBuilder],
  controllers: [HomeTabController],
})
export class HomeTabModule {}
