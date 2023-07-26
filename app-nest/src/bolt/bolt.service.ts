import { Inject, Injectable } from "@nestjs/common";
import {
  BOLT_MODULE_OPTIONS_TOKEN,
  BoltModuleOptions,
} from "./bolt.module-definition";
import { App } from "@slack/bolt";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";

@Injectable({})
export class BoltService {
  private bolt: App<StringIndexed>;

  // FIXME: Use Nest.js logger in place of Bolt's console logger.

  constructor(
    @Inject(BOLT_MODULE_OPTIONS_TOKEN) private options: BoltModuleOptions,
  ) {
    const { token, appToken, signingSecret } = options;
    this.bolt = new App({ appToken, token, signingSecret, socketMode: true });
  }

  async connect() {
    await this.bolt.start();
  }

  async disconnect() {
    await this.bolt.stop();
  }
}
