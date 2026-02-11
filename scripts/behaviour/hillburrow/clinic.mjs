import {Shop} from "../shop.mjs";
import {drunkenQuestOver, initializeDrunkenQuest, failDrunkenQuest, drunkQuestCompleteIntervalInDays} from "../../quests/hillburrow/saveDrunkenMaster.mjs";

export class Clinic extends Shop {
  constructor(model) {
    super(model);
  }

  get shopOwner() {
    return level.findObject("doctor");
  }

  get shopShelfs() {
    return ["shelf#1", "shelf#2"].map(path => this.model.findObject(path));
  }

  onZoneEntered(object) {
    if (object == game.player && !this.model.hasVariable("drunkQuestStarted"))
      return this.startDrunkQuest();
    return super.onZoneEntered(object);
  }

  startDrunkQuest() {
    this.model.setVariable("drunkQuestStarted", 1);
    this.model.tasks.addTask("timeoutDrunkQuest", drunkQuestCompleteIntervalInDays * 24 * 60 * 60 * 1000);
    initializeDrunkenQuest();
  }

  timeoutDrunkQuest() {
    if (!drunkenQuestOver())
      failDrunkenQuest();
  }
}
