import { Inject, Injectable } from "@nestjs/common";
import { App, LogLevel } from "@slack/bolt";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";
import { BoltLogger } from "./bolt-logger";
import {
  BOLT_MODULE_OPTIONS_TOKEN,
  BoltModuleOptions,
} from "./bolt.module-definition";

@Injectable()
export class BoltService {
  private bolt: App<StringIndexed>;

  constructor(@Inject(BOLT_MODULE_OPTIONS_TOKEN) options: BoltModuleOptions) {
    const logger = new BoltLogger();
    const { token, appToken, signingSecret } = options;
    this.bolt = new App({
      appToken,
      token,
      signingSecret,
      socketMode: true,
      logger,
      logLevel: LogLevel.INFO,
    });
  }

  async connect() {
    await this.bolt.start();
  }

  async disconnect() {
    await this.bolt.stop();
  }

  getBolt(): App<StringIndexed> {
    return this.bolt;
  }
}
