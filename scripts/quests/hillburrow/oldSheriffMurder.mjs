import {QuestHelper, QuestFlags} from "../helpers.mjs";

const questName = "hillburrow/oldSheriffMurder";

export function initializeOldSheriffMurderQuest() {
  game.quests.addQuest(questName);
}

export function hasOldSheriffMurderQuest() {
  return game.quests.hasQuest(questName);
}

export function hasActiveOldSheriffMurderQuest() {
  return hasOldSheriffMurderQuest() && game.quests.getQuest(questName).inProgress;
}

export function onEvidenceRevealed() {
  const quest = game.quests.addQuest(questName, QuestFlags.HiddenQuest);
  quest.completeObjective("findMurderer");
}

export function startWaterCarrierScene() {
  level.script.waterCarrierSheriffAmbushScene.initialize();
}

export function isAfterVengeanceSpeechEnabled(character) {
  const quest = game.quests.getQuest(questName);

  return quest
    && quest.isObjectiveCompleted("avenged")
    && !character.hasVariable("afterVengeanceSpeech");
}

export function onAfterVengeanceSpeechStarted(character) {
  character.setVariable("afterVengeanceSpeech", 1);
}

export function startOldSheriffVengeance() {
  const quest = game.quests.getQuest(questName);

  quest.setVariable("vengeanceOngoing", 1);
}

export function isVengeanceOngoing() {
  const quest = game.quests.getQuest(questName);

  return quest.hasVariable("vengeanceOngoing");
}

export function failVengeance() {
  const quest = game.quests.getQuest(questName);
  const waterCarrier = game.getCharacter("hillburrow/water-carrier");
  const sheriff = game.getCharacter("hillburrow/sheriff");

  if (sheriff)
    sheriff.takeDamage(sheriff.statistics.hitPoints * 10, waterCarrier);
  quest.setVariable("vengeanceFailure", 1);
  quest.unsetVariable("vengeanceOngoing");
  quest.completed = true;
  quest.failObjective("avenged");
}

export function shouldMurdererDisappear() {
  const quest = game.quests.getQuest(questName);
  return quest && quest.hasVariable("vengeanceFailure");
}

export class OldSheriffMurder extends QuestHelper {
  initialize() {
    this.model.location = "hillburrow";
    this.model.addObjective("findMurderer", this.tr("find-murderer"));
    this.model.addObjective("solveMurder", this.tr("solve-murder"));
    this.model.addObjective("talkToDoctor", this.tr("talk-to-doctor"));
  }

  get xpReward() {
    let value = 2000;
    if (this.model.isObjectiveCompleted("solveMurder"))
      value += 1250;
    if (this.model.isObjectiveCompleted("avenged"))
      value += 1150;
    return value;
  }

  getDescription() {
    let text = this.tr("description");

    text += this.tr("desc-autopsy");
    return text;
  }

  onCharacterKilled(character, killer) {
    if (character.characterSheet == "hillburrow/water-carrier" && isVengeanceOngoing()) {
      this.model.completeObjective("avenged");
      if (killer.characterSheet == "hillburrow/sheriff")
        this.model.setVariable("sherifffDealtFatalBlow", 1);
      this.model.unsetVariable("vengeanceOngoing");
      this.model.completed = true;
    }
  }
}
