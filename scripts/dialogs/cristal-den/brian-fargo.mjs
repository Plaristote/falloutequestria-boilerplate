import {skillCheck} from "../../cmap/helpers/checks.mjs";

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  onAcceptedCaravanWork() {
    game.setVariable("fargo-caravan-on", 1);
  }

  acceptNegociatorQuest() {
    // TODO implement negociator quest entry hook
  }

  hasThornhoofCaravanQuest() {
    const quest = game.quests.getQuest("thornhoof/caravan");
    return quest && quest.isObjectiveCompleted("convince-narbi-fargo");
  }

  thornhoofCaravanCost() {
    return 5000;
  }

  thornhoofCaravanCanPay() {
    return game.player.inventory.count("bottlecaps") >= this.thornhoofCaravanCost;
  }

  thornhoofCaravanIntimidateTest() {
    if (game.player.statistics.strength + game.player.statistics.endurance < 14)
      return "thornhoof-caravan/on-test-fail";
  }

  thornhoofCaravanSurvivalTest() {
    if (!skillCheck(game.player, "survival", {dice: 50, target: 100}))
      return "thornhoof-caravan/on-test-fail";
  }

  thornhoofCaravanConvinceTest() {
    const skill = game.player.statistics.speech > game.player.statistics.barter ? "speech" : "barter";
    if (!skillCheck(game.player, skill, {dice: 50, target: 100}))
      return "thornhoof-caravan/on-test-fail";
  }

  thornhoofCaravanAccepted() {
    const quest = game.quests.getQuest("thornhoof/caravan");
    quest.completeObjective("convince-narbi-fargo");
  }

  thornhoofCaravanAcceptedWithPayment() {
    const quest = game.quests.getQuest("thornhoof/caravan");
    quest.setVariable("paidInAdvance", this.thornhoofCaravanCost);
    this.thornhoofCaravanAccepted();
    game.player.inventory.removeItemOfType("bottlecaps", this.thornhoofCaravanCost);
    this.dialog.npc.inventory.addItemOfType("bottlecaps", this.thornhoofCaravanCost);
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
