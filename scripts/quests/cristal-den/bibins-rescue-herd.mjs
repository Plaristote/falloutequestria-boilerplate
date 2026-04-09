import {QuestHelper, QuestFlags, requireQuest} from "../helpers.mjs";

export default class BibinsRescueHerd extends QuestHelper {
  initialize() {
    this.model.addObjective("rescue");
  }

  get location() {
    return this.model.isObjectiveCrossedOff("rescue") ? "cristal-den" : "wasteland";
  }
}
