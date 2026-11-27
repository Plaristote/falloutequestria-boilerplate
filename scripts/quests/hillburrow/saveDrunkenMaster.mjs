import {QuestHelper} from "../helpers.mjs";
import {skillCheck} from "../../cmap/helpers/checks.mjs";

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
    return quest && !quest.isObjectiveCompleted("find-doctor-bag");
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

export function healDuringDrunkenQuest() {
  const quest = game.quests.getQuest(questName);

  quest.setVariable("playerHealed", 1);
}

// Medicine above this value lets the player operate without a doctor's bag.
export const drunkenQuestMedicineWithoutBag = 100;
// Difficulty of the operation when using the doctor's bag
// (success chance is about `medicine` percent when set to 100).
export const drunkenQuestSurgeryDifficulty = 100;
const killedPatientReputation = -60;

export function drunkenQuestKilledPatient() {
  const quest = game.quests.getQuest(questName);
  return !!quest && quest.hasVariable("playerKilledPatient");
}

// The patient is still lying unconscious on the clinic floor, waiting for help.
export function drunkenPatientNeedsHelp() {
  const quest = game.quests.getQuest(questName);
  const drunk = level.findObject("drunk");

  return !!quest && quest.inProgress && !!drunk && drunk.isAlive()
      && !quest.hasVariable("surgeryUnderway");
}

function startDoctorDialog(dialog) {
  const doctor = level.findObject("doctor");

  if (doctor && doctor.isAlive())
    doctor.script.startDialog(dialog);
}

function operateOnPatient(user, succeeds) {
  const quest = game.quests.getQuest(questName);

  quest.setVariable("surgeryUnderway", 1);
  game.appendToConsole(quest.tr("surgery-started"));
  game.asyncAdvanceTime(15, () => {
    quest.unsetVariable("surgeryUnderway");
    if (succeeds)
      patientSavedByPlayer(quest);
    else
      patientKilledByPlayer(quest, user);
  });
}

function patientSavedByPlayer(quest) {
  healDuringDrunkenQuest();
  completeDrunkenQuest();
  game.appendToConsole(quest.tr("surgery-success"));
  startDoctorDialog("hillburrow/doctor-drunk-healed");
}

function patientKilledByPlayer(quest, user) {
  const drunk = level.findObject("drunk");

  quest.setVariable("playerKilledPatient", 1);
  quest.failed = true;
  game.appendToConsole(quest.tr("surgery-failure"));
  drunk.takeDamage(9999, null);
  game.dataEngine.addReputation("hillburrow", killedPatientReputation);
  startDoctorDialog("hillburrow/doctor-drunk-killed");
}

// Using the medicine skill on the patient. Without a doctor's bag the player
// is warned, unless his medicine is high enough to operate with bare hooves.
// Returns true when the interaction was handled.
export function onMedicineUsedOnDrunk(user) {
  if (!drunkenPatientNeedsHelp()) return false;
  const quest = game.quests.getQuest(questName);

  if (user.statistics.medicine > drunkenQuestMedicineWithoutBag)
    operateOnPatient(user, true);
  else if (user.inventory.count("doctor-bag") > 0)
    game.appendToConsole(quest.tr("needs-doctor-bag-have"));
  else
    game.appendToConsole(quest.tr("needs-doctor-bag"));
  return true;
}

// Using a doctor's bag on the patient: risky operation, skill check on medicine.
export function onDoctorBagUsedOnDrunk(user) {
  if (!drunkenPatientNeedsHelp()) {
    game.appendToConsole(i18n.t("messages.nothing-happens"));
    return false;
  }
  const succeeds = user.statistics.medicine > drunkenQuestMedicineWithoutBag
    || skillCheck(user, "medicine", { target: drunkenQuestSurgeryDifficulty });

  markHealedWithBag(succeeds);
  operateOnPatient(user, succeeds);
  return true;
}

function markHealedWithBag(succeeds) {
  if (succeeds)
    game.quests.getQuest(questName).setVariable("healedWithBag", 1);
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
    if (game.player.inventory.count("doctor-bag") === 0)
      this.model.addObjective("find-doctor-bag", this.tr("findDoctorBag"));
    this.model.addObjective("save-drunken-master", this.tr("saveDrunkenMaster"));
  }

  onItemPicked(item) {
    if (item.itemType === "doctor-bag") {
      this.model.completeObjective("find-doctor-bag");
    }
  }

  getDescription() {
    let html = `<p>${this.model.tr("description")}</p>`;

    if (this.model.completed) {
      if (this.model.hasVariable("healedWithBag"))
        html += `<p>${this.model.tr("desc-player-healed-bag")}</p>`;
      else if (this.model.hasVariable("playerHealed"))
        html += `<p>${this.model.tr("desc-player-healed")}</p>`;
      else
        html += `<p>${this.model.tr("desc-doctor-healed")}</p>`;
      html += `<p>${this.model.tr("desc-saved")}</p>`;
    }
    else if (this.model.failed) {
      if (this.model.hasVariable("playerKilledPatient"))
        html += `<p>${this.model.tr("desc-killed-patient")}</p>`;
      else
        html += `<p>${this.model.tr("desc-failed")}</p>`;
    }
    return html;
  }
}
