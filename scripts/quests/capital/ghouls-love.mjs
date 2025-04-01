import {QuestHelper, QuestFlags} from "../helpers.mjs";

export class GhoulsLove extends QuestHelper {
  constructor(model) {
    super(model);
  }

  get xpReward() {
    if (this.model.hasVariable("discreet"))
      return 500;
    return 350;
  }

  initialize() {
    this.model.location = "capital";
    this.model.addObjective("investigate", this.tr("investigate"));
  }

  completeObjective(name) {
    this.model.hidden = false;
    switch (name) {
      case "investigate":
        this.model.addObjective("mediate", this.tr("mediate"));
        break ;
      case "mediate":
        this.model.completed = true;
        game.dataEngine.addReputation("ash-aven", 20);
    }
  }
}
