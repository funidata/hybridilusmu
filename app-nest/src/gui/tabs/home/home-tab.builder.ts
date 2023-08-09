import { Injectable } from "@nestjs/common";
import { Header } from "slack-block-builder";
import { DevToolsBuilder } from "../../dev/dev-tools.builder";
import { DayListBuilder } from "./day-list.builder";

// TODO: Create interface for these kind of builder classes.
@Injectable()
export class HomeTabBuilder {
  constructor(
    private dayListBlocks: DayListBuilder,
    private devToolsBuilder: DevToolsBuilder,
  ) {}

  async build() {
    const devTools = this.devToolsBuilder.build();
    const dayList = await this.dayListBlocks.build();
    return [...devTools, Header({ text: "Ilmoittautumiset" }), ...dayList];
  }
}
