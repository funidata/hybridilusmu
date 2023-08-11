import { Injectable } from "@nestjs/common";
import {
  Actions,
  Button,
  Context,
  Divider,
  Header,
  ViewBlockBuilder,
} from "slack-block-builder";
import BoltActions from "../../bolt/enums/bolt-actions.enum";
import { BlockBuilder } from "../block-builder.interface";

@Injectable()
export class DevToolsBuilder implements BlockBuilder<ViewBlockBuilder> {
  build() {
    return [
      Header({ text: ":wrench:  Developer Tools" }),
      Actions().elements(
        Button({
          text: ":recycle:  Sync Users",
          actionId: BoltActions.SYNC_USERS,
        }),
      ),
      Context().elements(
        "In development environment, users are not synchronized between local database and Slack on app start to avoid running into API rate limits due to hot-reloads. Sync users manually when necessary.",
      ),
      Divider(),
    ];
  }
}
