import { Injectable } from "@nestjs/common";
import { Header, ViewBlockBuilder } from "slack-block-builder";
import { BlockBuilder } from "../../block-builder.interface";
import { DevToolsBuilder } from "../../dev/dev-tools.builder";
import { DayListBuilder } from "./day-list.builder";

@Injectable()
export class HomeTabBuilder implements BlockBuilder<ViewBlockBuilder> {
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
