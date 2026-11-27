import * as Checks from "../../../cmap/helpers/checks.mjs";
import {escortDiscountRate} from "../../../quests/cristal-den/slavers-errand.mjs";

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  loadSlaversErrandQuest() {
    this.slaversErrand = game.quests.getQuest("cristal-den/slavers-errand");
  }

  isSlaversErrandActive() {
    const quest =  game.quests.getQuest("cristal-den/slavers-errand");

    // Not anymore once the player has taken the convoy to escort (it can still fail).
    return quest && !quest.isObjectiveCompleted("fetchSlaves") && !quest.failed && !quest.script.escortStarted;
  }

  // BEGIN Escort: the player walks the slaves to Hillburrow for a discount
  get slaversErrandEscortPrice() {
    return Math.ceil(this.slaversErrandPrice * (1 - escortDiscountRate));
  }

  get slaversErrandEscortDiscountPercent() {
    return Math.round(escortDiscountRate * 100);
  }

  slaversErrandCanOfferEscort() {
    // Other travels (caravans, expeditions) use the same machinery: one at a time.
    return game.script.activeProcesses.length === 0;
  }

  slaversErrandCanPayEscort() {
    return game.player.inventory.count("bottlecaps") >= this.slaversErrandEscortPrice;
  }

  onEscortAccepted() {
    const price = this.slaversErrandEscortPrice;

    game.player.inventory.removeItemOfType("bottlecaps", price);
    this.slaversErrand.script.spent += price;
    this.slaversErrand.script.startEscort(price);
    this.dialog.npc.tasks.addTask("startSlaveConvoy", 350, 1);
  }

  slaversErrandCanNegociate() {
    return game.player.statistics.barter >= 72 && this.slaversErrandUnitPrice > 25;
  }

  slaversErrandCanNegociateFurther() {
    return game.player.statistics.barter >= 85;
  }

  slaversErrandCanPay() {
    return game.player.inventory.count("bottlecaps") >= this.slaversErrandPrice;
  }

  get slaversErrandPrice() {
    return this.slaversErrandUnitPrice * 10;
  }

  get slaversErrandUnitPrice() {
    return this.slaversErrand.script.slaverSlavePrice;
  }

  get slaversErrandNegociatedPrice_1() { return 75; }
  get slaversErrandNegociatedPrice_2() { return 50; }
  get slaversErrandNegociatedPrice_3() { return 40; }
  get slaversErrandNegociatedPrice_4() { return 25; }

  set slaversErrandUnitPrice(value) {
    this.slaversErrand.script.slaverSlavePrice = value;
  }

  onNegociate() {
    this.slaversErrandUnitPrice = this.slaversErrandNegociatedPrice_1;
  }

  onNegociateFurther() {
    this.slaversErrandUnitPrice = this.slaversErrandNegociatedPrice_2;
  }

  onNegociateEvenFurtherBeyond() {
    const winner = Checks.skillContest(game.player, this.dialog.npc, "barter", 50);

    if (winner == game.player) {
      if (game.player.statistics.barter - this.dialog.npc.statistics.barter < 40)
        this.slaversErrandUnitPrice = this.slaversErrandNegociatedPrice_3;
      else
        this.slaversErrandUnitPrice = this.slaversErrandNegociatedPrice_4;
      return "slavers-errand/on-negociate-even-further-beyond";
    }
    return "slavers-errand/on-negociate-failure";
  }

  onSlavesBought() {
    game.player.inventory.removeItemOfType("bottlecaps", this.slaversErrandPrice);
    this.slaversErrand.script.spent += this.slaversErrandPrice;
    this.slaversErrand.completeObjective("fetchSlaves");
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
