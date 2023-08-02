import { DiscoveryService } from "@golevelup/nestjs-discovery";
import { Injectable } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import {
  App,
  Middleware,
  SlackAction,
  SlackActionMiddlewareArgs,
  SlackEventMiddlewareArgs,
} from "@slack/bolt";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";
import { BoltService } from "./bolt.service";
import { BOLT_ACTION_KEY } from "./decorators/bolt-action.decorator";
import { BOLT_EVENT_KEY } from "./decorators/bolt-event.decorator";

@Injectable()
export class BoltRegisterService {
  private bolt: App<StringIndexed>;

  constructor(
    boltService: BoltService,
    private discoveryService: DiscoveryService,
    private moduleRef: ModuleRef,
  ) {
    this.bolt = boltService.getBolt();
  }

  async registerEvents() {
    // TODO: This needs a type parameter. Or does it..?
    const controllers =
      await this.discoveryService.controllerMethodsWithMetaAtKey(
        BOLT_EVENT_KEY,
      );

    controllers.forEach((controller) => {
      const { meta } = controller;

      this.registerEventHandler(
        meta.toString(),
        controller.discoveredMethod.handler(),
      );
    });
  }

  private registerEventHandler(
    eventName: string,
    listener: Middleware<SlackEventMiddlewareArgs<string>, StringIndexed>,
  ) {
    this.bolt.event(eventName, listener);
  }

  async registerActions() {
    // TODO: This needs a type parameter. Or does it..?
    const controllers =
      await this.discoveryService.controllerMethodsWithMetaAtKey(
        BOLT_ACTION_KEY,
      );
    console.log(controllers);

    controllers.forEach((controller) => {
      const { meta } = controller;
      console.log(controller);

      this.registerActionHandler(
        meta.toString(),
        controller.discoveredMethod.handler(),
      );
    });
  }

  private registerActionHandler(
    eventName: string,
    listener: Middleware<SlackActionMiddlewareArgs<SlackAction>, StringIndexed>,
  ) {
    this.bolt.action(eventName, listener);
  }
}
