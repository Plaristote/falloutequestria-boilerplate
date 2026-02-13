import * as Checks from "../../cmap/helpers/checks.mjs";
import {QuestFlags} from "../../quests/helpers.mjs";
import {saboteurShouldDisappear} from "../../quests/hillburrow/sabotage.mjs";
import {potiokDefaultSlavePrice} from "../../quests/cristal-den/slavers-errand.mjs";

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
    if (this.sabotageQuest && !this.sabotageQuest.hidden && !this.sabotageQuest.completed)
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
        this.slaversErrandSlaveCost = 90;
      else if (game.player.statistics.barter > 100)
        this.slaversErrandSlaveCost = 80;
      else
        this.slaversErrandSlaveCost = 70;
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
    this.slaversErrand.script.spent -= amount;
  }

  slaversErrandAboutMoney() {
    this.slaversErrand.script.talkedMoney = true;
  }

  get slaversErrandSlaveCost() {
    return this.slaversErrand?.script?.potiokSlavePrice || potiokDefaultSlavePrice;
  }

  set slaversErrandSlaveCost(value) {
    this.slaversErrand.script.potiokSlavePrice = value;
  }

  get slaversErrandTargetSlaveCost() {
    return 150;
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

  sabotageKnowsAboutConfession() {
    return this.sabotageQuest.isObjectiveCompleted("confession");
  }

  sabotageKnowsAboutConfessionAndBibin() {
    return this.sabotageKnowsAboutConfession() && this.sabotageQuest.script.knowsAboutBibinInvolvment;
  }

  sabotageKnowsAboutWaterCarryingForSlaves() {
    return this.sabotageQuest.script.knowsAboutWaterCariedToSlaves;
  }

  sabotageCanAccuseWaterCarrier() {
    return this.sabotageKnowsAboutConfession() || this.sabotageKnowsAboutWaterCarryingForSlaves();
  }

  sabotageCanStartAccusations() {
    return this.sabotageCanAccuseWaterCarrier();
  }

  sabotageCanReportDynamite() {
    return this.sabotageQuest.isObjectiveCompleted("findWaterCarrierDynamite");
  }

  sabotageKilledWaterCarrier() {
    return (this.sabotageWaterCarrierDied() || this.sabogtageQuest.foughtWaterCarrier;
  }

  sabotageWaterCarrierDied() {
    const waterCarrier = game.getCharacter("hillburrow/water-carrier");

    return (!waterCarrier || !waterCarrier.isAlive());
  }

  sabotageCanConvinceOfWaterCarierCuplability() {
    return game.player.statistics.speech > 85;
  }

  sabotageCompleteQuestWaterCarrierRoute() {
    this.sabotageQuest.script.completeWaterCarrierRoute();
  }

  sabotageCompleteQuestWaterCarrierRouteWithBibinWarning() {
    this.sabotageQuest.script.completeWaterCarrierRoute();
    this.sabotageQuest.addObjective("mustWarnPotioksAboutBibin", this.sabotageQuest.tr("warnPotioks"));
  }

  sabotageTakeWaterCarrierToBoss() {
    if (!saboteurShouldDisappear())
      this.sabotageQuest.script.startWaterCarrierScene();
    else
    {
      game.asyncAdvanceTime(15);
      return "sabotage/accusation/water-carrier/404ed";
    }
  }

  giveSabotagePayment() {
    game.player.inventory.addItemOfType("bottlecaps", 100);
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
