import {QuestHelper} from "../helpers.mjs";

export default class GetRathianParts extends QuestHelper {
  initialize() {
    this.model.location = "junkville";
    this.model.addObjective("fetchParts", this.tr("fetch-parts"));
    this.model.addObjective("giveParts", this.tr("give-parts"));
  }

  get xpReward() {
    return 200;
  }

  // Redundent with rathian-shelf script, but maybe we should keep both
  onItemPicked(item) {
    if  (item.itemType == "quest-rathian-computer-parts")
      this.model.completeObjective("fetchParts");
  }

  completeObjective(objective) {
    if (objective == "giveParts")
      this.model.completed = true;
  }
}
