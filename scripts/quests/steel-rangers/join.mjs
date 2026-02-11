import {QuestHelper} from "../helpers.mjs";

export default class Join extends QuestHelper {
  initialize() {
    this.model.location = "capital-ruins";
    this.model.addObjective("find-ranger-plaques", this.tr("find-ranger-plaques"));
  }

  get plaqueCount() {
    return 0;
  }

  onCharacterKilled(character) {
    if (character.objectName === "cabbit")
      this.cabbitDead = true;
  }

  get cabbitDead() {
    return this.model.getVariable("cabbitDead", 0) == 1;
  }

  set cabbitDead(value) {
    this.model.setVariable("cabbitDead", 1);
  }

  getObjectives() {
    return [
      {
        label: this.tr("find-plaques", { count: 3, currentCount: this.plaqueCount }),
        success: this.plaqueCount == 3
      },
      {
        label: this.tr("bring-to-cabbit"),
        success: this.model.isObjectiveCompleted("bring-to-cabbit"),
        failure: this.model.isObjectiveCompleted("bring-to-cabbit") && !this.cabbitDead
      }
    ];
  }

  completeObjective(name) {
    if (name == "bring-to-cabbit")
      this.model.completed = true;
  }
}
