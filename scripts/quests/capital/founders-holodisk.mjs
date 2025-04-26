import {QuestHelper, QuestFlags} from "../helpers.mjs";

export default class FoundersHolodisk extends QuestHelper {
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

  getDescription() {
    let text = this.model.tr("description");
    if (this.model.isObjectiveCompleted("give-holodisk")) {
      text += "<br><br>";
      if (this.model.hasVariable("toldStory"))
        text += this.model.tr("description-end-disclosed");
      else
        text += this.model.tr("description-end");
    }
    return text;
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
