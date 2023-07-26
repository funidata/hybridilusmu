import { Module } from "@nestjs/common";
import { BoltModule } from "./bolt/bolt.module";
import configuration from "./config/configuration";

@Module({
  imports: [
    BoltModule.register({
      token: configuration.bolt.token,
      appToken: configuration.bolt.appToken,
      signingSecret: configuration.bolt.signingSecret,
    }),
  ],
})
export class AppModule {}
