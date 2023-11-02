import {QuestHelper} from "./helpers.mjs";

export class Quest extends QuestHelper {
  constructor(model) {
    super(model);
    this.xpReward = 1000;
  }

  initialize() {
    this.model.location = "city-sample";
  }
	
  getObjectives() {
    const array = [
      {label: this.tr("find-butter"), success: this.model.isObjectiveCompleted("butter")}
    ];

    if (this.model.isObjectiveCompleted("butter"))
      array.push({label: this.tr("give-butter"), success: this.model.isObjectiveCompleted("give")});
    if (this.model.isObjectiveCompleted("reward"))
      array.push({label: this.tr("got-reward"), success: true });
    return array;
  }

  onItemPicked(item) {
    if (item.itemType === "food-butter")
      this.completeObjective("butter");
  }

  onSuccess() {
    super.onSuccess();
    game.dataEngine.addReputation("city-sample", 25);
  }
}

export function create(model) {
  return new Quest(model);
}
