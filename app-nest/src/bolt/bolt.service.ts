import { DiscoveryService } from "@golevelup/nestjs-discovery";
import { Inject, Injectable } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import {
  App,
  LogLevel,
  Middleware,
  SlackEventMiddlewareArgs,
} from "@slack/bolt";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";
import { BoltLogger } from "./bolt-logger";
import {
  BOLT_MODULE_OPTIONS_TOKEN,
  BoltModuleOptions,
} from "./bolt.module-definition";
import { BOLT_EVENT_KEY } from "./decorators/bolt-event.decorator";

@Injectable()
export class BoltService {
  private bolt: App<StringIndexed>;

  constructor(
    @Inject(BOLT_MODULE_OPTIONS_TOKEN) private options: BoltModuleOptions,
    private discoveryService: DiscoveryService,
    private moduleRef: ModuleRef,
  ) {
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

    const c = await this.discoveryService.controllerMethodsWithMetaAtKey(
      BOLT_EVENT_KEY,
    );
    const { meta } = c[0];
    const cref = this.moduleRef.get(
      c[0].discoveredMethod.parentClass.injectType,
      { strict: false },
    );
    this.registerEventHandler(meta.toString(), cref.getView());
  }

  async disconnect() {
    await this.bolt.stop();
  }

  registerEventHandler(
    eventName: string,
    listener: Middleware<SlackEventMiddlewareArgs<string>, StringIndexed>,
  ) {
    this.bolt.event(eventName, listener);
  }
}
