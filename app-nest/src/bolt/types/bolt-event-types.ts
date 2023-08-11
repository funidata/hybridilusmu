import {
  AllMiddlewareArgs,
  AppHomeOpenedEvent,
  SlackEventMiddlewareArgs,
  UserProfileChangedEvent,
} from "@slack/bolt";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";

export type AppHomeOpenedArgs = SlackEventMiddlewareArgs<
  AppHomeOpenedEvent["type"]
> &
  AllMiddlewareArgs<StringIndexed>;

export type UserProfileChangedArgs = SlackEventMiddlewareArgs<
  UserProfileChangedEvent["type"]
> &
  AllMiddlewareArgs<StringIndexed>;
