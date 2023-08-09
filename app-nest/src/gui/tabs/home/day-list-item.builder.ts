import { Injectable } from "@nestjs/common";
import { Dayjs } from "dayjs";
import {
  Actions,
  Button,
  Header,
  Option,
  OverflowMenu,
  StaticSelect,
  ViewBlockBuilder,
} from "slack-block-builder";
import BoltActions from "../../../bolt/enums/bolt-actions.enum";
import { BlockBuilder } from "../../block-builder.interface";

type DayListItemProps = {
  date: Dayjs;
};

@Injectable()
export class DayListItemBuilder implements BlockBuilder<ViewBlockBuilder> {
  build({ date }: DayListItemProps) {
    const dateString = date.toISOString();

    return [
      Header({ text: date.format("dd D.M.") }),
      Actions().elements(
        Button({
          text: "Toimistolla",
          actionId: BoltActions.SET_OFFICE_PRESENCE,
          value: dateString,
        }),
        Button({
          text: "Etänä",
          actionId: BoltActions.SET_REMOTE_PRESENCE,
          value: dateString,
        }),
        StaticSelect({
          placeholder: "Valitse toimipiste",
          actionId: BoltActions.SELECT_OFFICE_FOR_DATE,
        })
          .initialOption(
            Option({
              text: "Helsinki",
              value: JSON.stringify({ value: "hki", date }),
            }),
          )
          .options(
            Option({
              text: "Helsinki",
              value: JSON.stringify({ value: "hki", date }),
            }),
            Option({
              text: "Tampere",
              value: JSON.stringify({ value: "tre", date }),
            }),
          ),
        OverflowMenu({ actionId: BoltActions.DAY_LIST_ITEM_OVERFLOW }).options(
          Option({
            text: "Poista ilmoittautuminen",
            value: JSON.stringify({
              type: "remove_presence",
              date,
            }),
          }),
        ),
      ),
    ];
  }
}
