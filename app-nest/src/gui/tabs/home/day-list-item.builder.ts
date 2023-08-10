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
import { Office } from "../../../entities/office/office.entity";
import { BlockBuilder } from "../../block-builder.interface";

type DayListItemProps = {
  date: Dayjs;
  offices: Office[];
};

@Injectable()
export class DayListItemBuilder implements BlockBuilder<ViewBlockBuilder> {
  build(props: DayListItemProps) {
    const { date } = props;
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
        this.getOfficeBlocks(props),
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

  private getOfficeBlocks({ date, offices }: DayListItemProps) {
    // Don't show office select at all if no offices exist.
    if (offices.length === 0) {
      return null;
    }

    const Options = offices.map(({ id, name }) =>
      Option({
        text: name,
        value: JSON.stringify({ value: id, date }),
      }),
    );

    return StaticSelect({
      placeholder: "Valitse toimipiste",
      actionId: BoltActions.SELECT_OFFICE_FOR_DATE,
    })
      .initialOption(Options[0])
      .options(Options);
  }
}
