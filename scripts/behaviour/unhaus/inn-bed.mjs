import InnBed from "../inn-bed.mjs";
import {requireQuest} from "../../quests/helpers.mjs";

function kidnapped() {
  const quest = game.quests.getQuest("changelingQuest");
  return quest && quest.hasVariable("kidnapped");
}

export default class extends InnBed {
  sleepFor(seconds) {
    const changelingQuest = requireQuest("changelingQuest");
    if (changelingQuest.script.canKidnapPlayer()) {
      changelingQuest.script.kidnapPlayer();
    } else {
      super.sleepFor(seconds);
    }
  }
}
