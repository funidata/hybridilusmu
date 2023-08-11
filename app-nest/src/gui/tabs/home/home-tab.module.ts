import { Module } from "@nestjs/common";
import { OfficeModule } from "../../../entities/office/office.module";
import { DevToolsModule } from "../../dev/dev-tools.module";
import { DayListItemBuilder } from "./day-list-item.builder";
import { DayListBuilder } from "./day-list.builder";
import { HomeTabBuilder } from "./home-tab.builder";
import { HomeTabController } from "./home-tab.controller";
import { VisibleOfficeSelectBuilder } from "./visible-office-select.builder";

@Module({
  imports: [DevToolsModule, OfficeModule],
  providers: [
    HomeTabBuilder,
    DayListBuilder,
    DayListItemBuilder,
    VisibleOfficeSelectBuilder,
  ],
  controllers: [HomeTabController],
})
export class HomeTabModule {}
