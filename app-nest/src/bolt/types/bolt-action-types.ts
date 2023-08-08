import {
  AllMiddlewareArgs,
  SlackAction,
  SlackActionMiddlewareArgs,
} from "@slack/bolt";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";

export type BoltActionArgs = SlackActionMiddlewareArgs<SlackAction> &
  AllMiddlewareArgs<StringIndexed>;
