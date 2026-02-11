import {QuestHelper} from "./helpers.mjs";

function isAlcoholicItem(item) {
  return item.script && item.script.alcoholic === true;
}

export class StableParty extends QuestHelper {
  constructor(model) {
    super(model);
    this.requiredBottles = 15;
  }
  
  initialize() {
    this.model.location = "stable-103";
  }

  getDescription() {
    let text = "<p>" + this.tr("description", { requiredBottles: this.requiredBottles }) + "</p>";

    if (this.model.completed)
      text += "<p>" + this.tr("desc-done") + "</p>";
    return text;
  }

  onItemPicked(item) {
    if (isAlcoholicItem(item) && this.hasEnoughBottles())
      this.model.completeObjective("objective-bottles");
  }
  
  bottleCount() {
    let count = 0;
    for (let i = 0 ; i < game.player.inventory.items.length ; ++i) {
      if (isAlcoholicItem(game.player.inventory.items[i]))
        count += game.player.inventory.items[i].quantity;
    }
    return count;
  }

  hasEnoughBottles() {
    return this.bottleCount() >= this.requiredBottles;
  }

  giveBottles() {
    let required = this.requiredBottles;

    for (let i = 0 ; i < game.player.inventory.items.length && required > 0 ; ++i) {
      const item = game.player.inventory.items[i];
      if (isAlcoholicItem(item)) {
        if (item.quantity > required) {
          required = 0;
          item.quantity -= required;
        } else {
          required -= item.quantity;
          game.player.inventory.removeItem(item);
          --i;
        }
      }
    }
    this.model.completeObjective("give");
    // TODO instead of completing quest right away, we should script the party at 20h and have the quest only complete at that time
    this.model.completed = true;
  }

  getObjectives() {
    let objectives = [
      {
        label: this.tr("objective-bottles", {count: this.requiredBottles, currentCount: this.bottleCount()}),
        success: this.model.isObjectiveCompleted("bottles")
      },
      {
        label: this.tr("give-bottles-to-barmaid"),
        success: this.model.isObjectiveCompleted("give")}
    ];
    return objectives;
  }

  get xpReward() {
    return 750;
  }

  onSuccess() {
    super.onSuccess();
    game.dataEngine.addReputation("stable-103", 75);
  }
}
