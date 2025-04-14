import {QuestHelper, QuestFlags} from "../helpers.mjs";

export default class FindSpinel extends QuestHelper {
  constructor(model) {
    super(model);
  }

  get xpReward() {
    return 2000;
  }

  initialize() {
    this.model.location = "capital";
    this.model.addObjective("find-spinel", this.tr("find-spinel"));
    if (game.player.inventory.count("electromagic-spinel") > 0)
      this.model.completeObjective("find-spinel");
    this.model.addObjective("give-spinel", this.tr("give-spinel"));
  }

  onItemPicked(item) {
    if (item.itemType === "electromagic-spinel")
      this.model.completeObjective("find-spinel");
  }

  completeObjective(name) {
    this.model.hidden = false;
    switch (name) {
      case "give-spinel":
        this.model.completed = true;
        break ;
    }
  }
}
