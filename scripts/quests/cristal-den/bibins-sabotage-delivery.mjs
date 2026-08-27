import {QuestHelper, QuestFlags, requireQuest} from "../helpers.mjs";

const questName = "cristal-den/bibins-sabotage-delivery";

export function onSuitcaseOpened() {
  const quest = game.quests.getQuest(questName);

  quest.setVariable("suitcaseOpened", 1);
  quest.failObjective("delivery");
  quest.failed = true;
  game.appendToConsole(quest.tr("suitcase-opened-notification"));
}

export function hasSuitcaseBeenOpened() {
  const quest = game.quests.getQuest(questName);
  return quest && quest.getVariable("suitcaseOpened", 0) == 1;
}

export function isPlayerLookingForWaterCarrier() {
  const quest = game.quests.getQuest(questName);
  return quest && quest.script.hasEvent("learn-water-carrier-identity");
}

export function triggerLearnWaterCarrierIdentity() {
  const quest = requireQuest(questName, Quest.HiddenQuest);
  quest.script.pushUniqueEvent("learn-water-carrier-identity");
}

export class BibinsSabotageDelivery extends QuestHelper {
  constructor(model) {
    super(model);
    this.xpReward = 500;
  }

  initialize() {
    this.model.addObjective("delivery", this.tr("delivery"));
    this.model.addObjective("ask-password", this.tr("password"));
    this.model.addObjective("report", this.tr("report"));
  }

  get location() {
    return this.model.isObjectiveCompleted("delivery") ? "cristal-den" : "hillburrow";
  }

  onCharacterKilled(character) {
    switch (character.objectName) {
      case "water-carrier": {
        if (this.model.isObjectiveCompleted("delivery")) { break ; }
        else { this.model.failObjective("delivery"); }
      }
      case "bibin":
        this.model.failed = true;
        break ;
    }
  }

  completeObjective(name) {
    if (name == "report")
      this.model.completed = true;
  }

  onSuccess() {
    game.dataEngine.addReputation("bibins-band", 75);
    super.onSuccess();
  }
}
