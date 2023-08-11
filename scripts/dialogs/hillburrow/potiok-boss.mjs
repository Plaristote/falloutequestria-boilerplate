import * as Checks from "../../cmap/helpers/checks.mjs";
import {QuestFlags} from "../../quests/helpers.mjs";

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  get slaversErrand() {
    return game.quests.getQuest("cristal-den/slavers-errand");
  }

  get sabotageQuest() {
    return game.quests.getQuest("hillburrow/sabotage");
  }

  getEntryPoint() {
    if (this.sabotageQuest && !this.sabotageQuest.completed)
      return "sabotage/entry";
    else if (this.slaversErrand) {
      if (!this.slaversErrand.isObjectiveCompleted("fetchSlaves"))
        return "slavers-errand/waiting-slaves";
      if (!this.slaversErrand.isObjectiveCompleted("reportToBittyPotiok"))
        return "slavers-errand/waiting-report";
    }
    else
      return null;
    return "entry";
  }

  startCombat() {
    this.dialog.npc.setAsEnemy(game.player);
  }

  onFightGuards() {
    const office = level.findGroup("house.office");
    const guards = [
      level.findObject("guards.day-shift.mercenary#3"),
      level.findObject("guards.day-shift.mercenary#4")
    ];

    guards.forEach(guard => {
      level.moveCharacterToZone(guard, office.controlZone);
    });
    this.startCombat();
  }

  onChasedAway() {
    level.moveCharacterToZone(game.player, "house-front");
  }

  onTakeOnNewQuest() {
    game.quests.addQuest("hillburrow/sabotage", QuestFlags.HiddenQuest);
    if (this.sabotageQuest.hidden)
      return "sabotage/entry";
  }

  /*
   * Slaver's Errand Quest
   */
  takeSlaversErrandQuest() {
    const quest = game.quests.addQuest("cristal-den/slavers-errand");
    quest.setVariable("potiokSlavePrice", this.slaversErrandSlaveCost);
  }

  slaversErrandCanNegociatePrice() {
    return game.player.statistics.barter >= 72;
  }

  slaversErrandNegociatePrice() {
    const winner = Checks.skillContest(game.player, this.dialog.npc, "barter", 20);

    if (winner == game.player) {
      if (game.player.statistics.barter > 110)
        this.slaversErrandSlaveCost = 200;
      else if (game.player.statistics.barter > 100)
        this.slaversErrandSlaveCost = 175;
      else
        this.slaversErrandSlaveCost = 150;
      return "slavers-errand/price-upped";
    }
    return "slavers-errand/price-not-upped";
  }

  slaversErrandReported() {
    this.slaversErrand.completeObjective("reportToBittyPotiok");
  }

  slaversErrandNegociateRefund() {
    const winner = Checks.skillContest(game.player, this.dialog.npc, "barter", 50);
    return `slavers-errand/refund-negociation-${winner == game.player ? "accepted" : "rejected"}`;
  }

  slaversErrandIncreaseRefund() {
    this.withRefundBonus = true;
  }

  onTakeRefund() {
    let amount = this.slaversErrandRefundAmount;
    if (this.withRefundBonus)
      amount += 100;
    game.player.inventory.addItemOfType("bottlecaps", amount);
  }

  get slaversErrandSlaveCost() {
    if (this.dialog.npc.hasVariable("potiokSlavePrice"))
      return this.dialog.npc.getVariable("potiokSlavePrice");
    return 50;
  }

  set slaversErrandSlaveCost(value) {
    this.dialog.npc.setVariable("potiokSlavePrice", value);
  }

  get slaversErrandTargetSlaveCost() {
    return 300;
  }

  get slaversErrandRefundAmount() {
    return this.slaversErrandSlaveCost * 10;
  }

  /*
   * Sabotage Quest
   */
  takeSabotageQuest() {
    this.sabotageQuest.hidden = false;
  }

  sabotageQuestPointersGiven() {
    this.sabotageQuest.script.onPointersGivenByBittyPotiok();
  }

  sabotageQuestMotivesGiven() {
    this.sabotageQuest.script.onMotivesSuggestedByBittyPotiok();
  }

}

export function create(dialog) {
  return new Dialog(dialog);
}
