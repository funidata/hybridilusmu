import { Module } from "@nestjs/common";

import { BoltModule } from "./bolt/bolt.module";

@Module({
  imports: [
    BoltModule.register({
      token: process.env.SLACK_BOT_TOKEN,
      appToken: process.env.SLACK_APP_TOKEN,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
    }),
  ],
})
export class AppModule {}
