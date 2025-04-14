import {QuestHelper, QuestFlags} from "../helpers.mjs";

export default class FindSpinel extends QuestHelper {
  constructor(model) {
    super(model);
  }

  get xpReward() {
    return 750;
  }

  initialize() {
    this.model.location = "capital";
    this.model.addObjective("find-holodisk", this.tr("find-holodisk"));
    if (game.player.inventory.count("quest-holodisk-founder") > 0)
      this.model.completeObjective("holodisk-ashaven");
    this.model.addObjective("give-holodisk", this.tr("give-holodisk"));
  }

  onItemPicked(item) {
    if (item.itemType === "quest-holodisk-founder")
      this.model.completeObjective("find-holodisk");
  }

  completeObjective(name) {
    this.model.hidden = false;
    switch (name) {
      case "give-holodisk":
        this.model.completed = true;
        break ;
    }
  }
}
