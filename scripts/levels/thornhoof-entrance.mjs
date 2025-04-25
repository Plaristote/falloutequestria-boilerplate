import {LevelBase} from "./base.mjs";

export default class extends LevelBase {
  loadCaravanIntoCity() {
    const quest = game.quests.getQuest("thornhoof/caravan");
    if (quest.script.caravanInProgress)
      quest.completeObjective("lead-caravan");
    super.loadCaravanIntoCity();
  }
}
