import { DiscoveryService } from "@golevelup/nestjs-discovery";
import { Injectable } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { App, Middleware, SlackEventMiddlewareArgs } from "@slack/bolt";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";
import { BoltService } from "./bolt.service";
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
    // TODO: This needs a type parameter.
    const controllers =
      await this.discoveryService.controllerMethodsWithMetaAtKey(
        BOLT_EVENT_KEY,
      );

    controllers.forEach((controller) => {
      const { meta } = controller;
      const cref = this.moduleRef.get(
        controller.discoveredMethod.parentClass.injectType,
        { strict: false },
      );
      this.registerEventHandler(meta.toString(), cref.getView());
    });
  }

  private registerEventHandler(
    eventName: string,
    listener: Middleware<SlackEventMiddlewareArgs<string>, StringIndexed>,
  ) {
    this.bolt.event(eventName, listener);
  }
}
