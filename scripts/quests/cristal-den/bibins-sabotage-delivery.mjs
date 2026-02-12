import {QuestHelper, QuestFlags, requireQuest} from "../helpers.mjs";

const questName = "cristal-den/bibins-sabotage-delivery";

export function onSuitcaseOpened() {
  const quest = game.quests.getQuest(questName);

  quest.failObjective("delivery");
  quest.failed = true;
  game.appendToConsole(quest.tr("suitcase-opened-notification"));
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
