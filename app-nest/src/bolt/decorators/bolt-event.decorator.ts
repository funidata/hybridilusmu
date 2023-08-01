import { SetMetadata } from "@nestjs/common";

export const BOLT_EVENT_KEY = "BoltEvent";

const BoltEvent = (eventName: string) => SetMetadata(BOLT_EVENT_KEY, eventName);

export default BoltEvent;
