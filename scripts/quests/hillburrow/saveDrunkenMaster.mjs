import {QuestHelper} from "../helpers.mjs";

const questName = "hillburrow/saveDrunkenMaster";
export const drunkQuestCompleteIntervalInDays = 1;

export function drunkenQuestOver() {
  const quest = game.quests.getQuest(questName);
  return quest && !quest.inProgress;
}

export function drunkenQuestSucceeded() {
  const quest = game.quests.getQuest(questName);
  return quest && quest.completed;
}

export function drunkenQuestDoctorBagNeeded() {
  if (!drunkenQuestOver()) {
    const quest = game.quests.getQuest(questName);
    return !quest.isObjectiveCompleted("find-doctor-bag");
  }
  return false;
}

export function initializeDrunkenQuest() {
  const doctor = level.findObject("doctor");
  const drunk  = level.findObject("drunk");

  game.quests.addQuest(questName);
  drunk.fallUnconscious();
  drunk.setAnimation("dead");
  doctor.script.startDialog("hillburrow/doctor-drunk-quest");
}

export function failDrunkenQuest() {
  const drunk = level.findObject("drunk");
  const quest = game.quests.getQuest(questName);

  level.deleteObject(drunk);
  quest.failed = true;
  game.dataEngine.addReputation("hillburrow", -25);
}

export function completeDrunkenQuest() {
  const drunk = level.findObject("drunk");
  const quest = game.quests.getQuest(questName);

  quest.completeObjective("save-drunken-master");
  quest.completed = true;
  drunk.wakeUp();
  if (typeof drunk.script.onHealed == "function")
    drunk.script.onHealed();
  game.dataEngine.addReputation("hillburrow", 25);
}

export class SaveDrunkenMaster extends QuestHelper {
  initialize() {
    this.model.location = "hillburrow";
  }

  getObjectives() {
    return [
      { label: this.tr("findDoctorBag"), success: this.isObjectiveCompleted("find-doctor-bag") },
      { label: this.tr("saveDrunkenMaster"), success: this.isObjectiveCompleted("save-drunken-master") }
    ];
  }

  onItemPicked(item) {
    if (item.itemType === "doctor-bag") {
      this.model.completeObjective("find-doctor-bag");
    }
  }
}
