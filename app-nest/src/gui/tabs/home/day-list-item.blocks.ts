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
        action_id: BoltActions.REGISTER_PRESENCE,
        value: date.toISOString(),
      },
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "Etänä",
        },
      },
      {
        action_id: "text1234",
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
          value: "hki",
        },
        options: [
          {
            text: {
              type: "plain_text",
              text: "Helsinki",
            },
            value: "hki",
          },
          {
            text: {
              type: "plain_text",
              text: "Tampere",
            },
            value: "tre",
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
