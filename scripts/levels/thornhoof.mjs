import {LevelBase} from "./base.mjs";

export default class extends LevelBase {
  loadCaravanIntoCity() {
    const quest = game.quests.getQuest("thornhoof/caravan");
    if (quest.isObjectiveCompleted("lead-caravan"))
      quest.completeObjective("lead-caravan");
    super.loadCaravanIntoCity();
  }
}
