import {QuestHelper} from "../helpers.mjs";
import {bookwormRequirement} from "../../cmap/perks/bookworm.mjs";

function isBookItem(item) {
  return item.script && item.script.isBook === true;
}

export default class extends QuestHelper {
  constructor(model) {
    super(model);
    this.requiredBooks = bookwormRequirement;
  }

  initialize() {
    this.model.location = "stable-103";
  }

  getDescription() {
    let text = this.tr("description", { requiredBottles: this.requiredBottles });

    if (this.model.completed)
      text += `<p>${this.tr("desc-done")}</p>`;
    return text;
  }

  onItemPicked() {
    if (isBookItem(item) && this.hasEnoughBooks())
      this.model.completeObjective("books");
  }

  bookCount() {
    let count = 0;
    for (let i = 0 ; i < game.player.inventory.items.length ; ++i) {
      if (isBookItem(game.player.inventory.items[i]))
        count += game.player.inventory.items[i].quantity;
    }
    return count;
  }

  hasEnoughBooks() {
    return this.bookCount() >= this.requiredBooks;
  }

  getObjectives() {
    return [
      {
        label: this.tr("objective-books", {count: this.requiredBooks, currentCount: this.bookCount()}),
        success: this.model.isObjectiveCompleted("books")
      },
      {label: this.tr("give-bottles-to-library"), success: this.model.isObjectiveCompleted("give")}
    ];
  }

  giveBooks() {
    let required = this.requiredBooks;

    for (let i = 0 ; i < game.player.inventory.items.length && required > 0 ; ++i) {
      const item = game.player.inventory.items[i];
      if (isBookItem(item)) {
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
    this.model.completed = true;
  }

  onSuccess() {
    super.onSuccess();
    game.dataEngine.addReputation("stable-103", 25);
  }

  get xpReward() {
    return 750;
  }
}
