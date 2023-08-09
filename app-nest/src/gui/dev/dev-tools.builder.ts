import { Injectable } from "@nestjs/common";
import { Actions, Button, Context, Divider, Header } from "slack-block-builder";
import BoltActions from "../../bolt/enums/bolt-actions.enum";

@Injectable()
export class DevToolsBuilder {
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
