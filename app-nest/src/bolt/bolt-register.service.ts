import {
  DiscoveredMethod,
  DiscoveryService,
} from "@golevelup/nestjs-discovery";
import { Injectable } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { App } from "@slack/bolt";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";
import { BoltService } from "./bolt.service";
import { BOLT_ACTION_KEY } from "./decorators/bolt-action.decorator";
import { BOLT_EVENT_KEY } from "./decorators/bolt-event.decorator";

type EventType = typeof BOLT_ACTION_KEY | typeof BOLT_EVENT_KEY;

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

  /**
   * Register all controller methods decorated with one of our Bolt event decorators.
   */
  async registerAllHandlers() {
    const eventTypes = [BOLT_ACTION_KEY, BOLT_EVENT_KEY] as const;

    await Promise.all(
      eventTypes.map((eventType) => this.registerHandlers(eventType)),
    );
  }

  /**
   * Register all handler functions of certain `EventType`.
   */
  private async registerHandlers(eventType: EventType) {
    const controllers =
      await this.discoveryService.controllerMethodsWithMetaAtKey(eventType);

    controllers.forEach((controller) => {
      const { meta, discoveredMethod } = controller;
      const eventName = meta.toString();
      const handler = this.getHandler(discoveredMethod);

      this.registerHandler(eventType, eventName, handler);
    });
  }

  /**
   * Get handler function via `ModuleRef` and bind it to correct context.
   */
  private getHandler(discoveredMethod: DiscoveredMethod) {
    const cref = this.moduleRef.get(discoveredMethod.parentClass.injectType, {
      strict: false,
    });
    // N.B.: Take care where you call the discovered handler method. This is an easy
    // place to bind it into a wrong context. Ask me how I know.
    return cref[discoveredMethod.methodName]();
  }

  /**
   * Register handler function with Bolt API.
   */
  private registerHandler(
    eventType: EventType,
    eventName: string,
    handler: any,
  ) {
    if (eventType === BOLT_ACTION_KEY) {
      this.bolt.action(eventName, handler);
    } else if (eventType === BOLT_EVENT_KEY) {
      this.bolt.event(eventName, handler);
    }
  }
}
