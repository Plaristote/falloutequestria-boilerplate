import {QuestHelper, QuestFlags} from "../helpers.mjs";

const finalQuest = "";

export default class extends QuestHelper {
  constructor(model) {
    super(model);
    this.xpReward = 2500;
  }

  initialize() {
    this.model.location = "cristal-den";
  }

  completeObjective(name) {
    if (name === finalQuest)
      this.model.completed = true;
  }
}
