import devTools from "../../dev/dev-tools";
import getDayListBlocks from "./day-list.blocks";

const getHomeTabBlocks = () => [
  ...devTools,
  {
    type: "header",
    text: {
      type: "plain_text",
      text: "Ilmoittautumiset",
    },
  },
  ...getDayListBlocks(),
];

export default getHomeTabBlocks;
