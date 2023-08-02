import { SetMetadata } from "@nestjs/common";

export const BOLT_ACTION_KEY = "BoltAction";

const BoltAction = (actionName: string) =>
  SetMetadata(BOLT_ACTION_KEY, actionName);

export default BoltAction;
