import {QuestHelper} from "./helpers.mjs";

function isAlcoholicItem(item) {
  return item.script && item.script.alcoholic === true;
}

export class StableParty extends QuestHelper {
  constructor(model) {
    super(model);
    this.requiredBottles = 40;
  }
  
  initialize() {
    this.model.location = "stable-103";
  }

  onItemPicked(item) {
    if (isAlcoholicItem(item) && this.hasEnoughBottles())
      this.model.completeObjective("objective-bottles");
  }
  
  bottleCount() {
    let count = 0;
    for (let i = 0 ; i < game.player.inventory.items.length ; ++i) {
      if (isAlcoholicItem(game.player.inventory.items[i]))
        count++;
    }
    return count;
  }

  hasEnoughBottles() {
    return this.bottleCount() >= this.requiredBottles;
  }

  getObjectives() {
    return [
      {
        label: this.tr("objective-bottles", {count: this.requiredBottles, currentCount: this.bottleCount()}),
        success: this.model.isObjectiveCompleted("bottles")
      },
      {label: this.tr("give-bottles-to-barmaid"), success: this.model.isObjectiveCompleted("give")}
    ];
  }

  onCompleted() {
    const xp = 1000;

    game.appendToConsole(i18n.t("messages.quest-complete", {
      title: this.tr("title"),
      xp: xp
    }));
    game.player.statistics.addExperience(xp);
    game.dataEngine.addReputation("stable-103", 100);
  }
}
