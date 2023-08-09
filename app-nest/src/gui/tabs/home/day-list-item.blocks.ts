import { Dayjs } from "dayjs";
import BoltActions from "../../../bolt/enums/bolt-actions.enum";

type DayListItemProps = {
  date: Dayjs;
};

const getDayListItemBlocks = ({ date }: DayListItemProps) => [
  {
    type: "header",
    text: {
      type: "plain_text",
      text: date.format("dd D.M."),
    },
  },
  {
    type: "actions",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "Toimistolla",
        },
        style: "primary",
        action_id: BoltActions.SET_OFFICE_PRESENCE,
        value: date.toISOString(),
      },
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "Etänä",
        },
        action_id: BoltActions.SET_REMOTE_PRESENCE,
        value: date.toISOString(),
      },
      {
        action_id: BoltActions.SELECT_OFFICE_FOR_DATE,
        type: "static_select",
        placeholder: {
          type: "plain_text",
          text: "Valitse toimipiste",
        },
        initial_option: {
          text: {
            type: "plain_text",
            text: "Helsinki",
          },
          value: JSON.stringify({ value: "hki", date: date.toISOString() }),
        },
        options: [
          {
            text: {
              type: "plain_text",
              text: "Helsinki",
            },
            value: JSON.stringify({ value: "hki", date: date.toISOString() }),
          },
          {
            text: {
              type: "plain_text",
              text: "Tampere",
            },
            value: JSON.stringify({ value: "tre", date: date.toISOString() }),
          },
        ],
      },
      {
        type: "overflow",
        options: [
          {
            text: {
              type: "plain_text",
              text: "Poista ilmoittautuminen",
            },
            value: "value-0",
          },
        ],
        action_id: "overflow",
      },
    ],
  },
];

export default getDayListItemBlocks;
