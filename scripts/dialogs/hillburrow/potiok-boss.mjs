import * as Checks from "../../cmap/helpers/checks.mjs";
import {QuestFlags} from "../../quests/helpers.mjs";
import {saboteurShouldDisappear} from "../../quests/hillburrow/sabotage.mjs";
import {potiokDefaultSlavePrice} from "../../quests/cristal-den/slavers-errand.mjs";
import {hasSuitcaseBeenOpened} from "../../quests/cristal-den/bibins-sabotage-delivery.mjs";

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
    if (this.escortFailed)
      return this.slaversErrand.script.escortFailure == "wiped" ? "slavers-errand/execution-wiped" : "slavers-errand/execution-deserted";
    if (this.sabotageQuest && !this.sabotageQuest.hidden && !this.sabotageQuest.completed)
      return "sabotage/entry";
    else if (this.slaversErrand) {
      if (!this.slaversErrand.isObjectiveCompleted("fetchSlaves"))
        return "slavers-errand/waiting-slaves";
      if (!this.slaversErrand.isObjectiveCompleted("reportToBittyPotiok"))
        return this.waitingReportState;
    }
    else
      return null;
    return "entry";
  }

  // BEGIN Slaves errand, escorted convoy
  get escortFailed() {
    return !!this.slaversErrand && this.slaversErrand.failed && this.slaversErrand.script.escortStarted;
  }

  get slavesDelivered() {
    return this.slaversErrand.script.slavesDelivered;
  }

  get slavesLost() {
    return this.slaversErrand.script.slavesLost;
  }

  // How Bitty receives the slaves depends on how many survived the trip.
  get waitingReportState() {
    const script = this.slaversErrand.script;

    switch (script.lossTier) {
    case "heavy": return "slavers-errand/waiting-report-furious";
    case "some":  return "slavers-errand/waiting-report-angry";
    }
    return script.escortStarted ? "slavers-errand/waiting-report-escort" : "slavers-errand/waiting-report";
  }

  // The player abandoned the convoy or let every slave die: Bitty has them executed.
  startExecution() {
    game.diplomacy.setAsEnemy(true, "player", "hillburrow-potioks");
    this.onFightGuards();
  }

  startExecutionFlee() {
    game.diplomacy.setAsEnemy(true, "player", "hillburrow-potioks");
    this.onChasedAway();
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
    this.sabotageQuest.setVariable("receivedFromBitty", 1);
    if (this.sabotageQuest.hidden)
      return "sabotage/entry";
  }

  sentByMatriarch() {
    return this.sabotageQuest && this.sabotageQuest.script.sentByMatriarch;
  }

  sentByMatriarchIntimidate() {
    if (Checks.skillCheck(game.player, "speech", 110))
      return "matriarch-intro/intimidated";
    return "introduction-chase-away";
  }

  sentByMatriarchCanBarter() {
    return game.player.statistics.barter >= 65;
  }

  matriarchTakeIncreasedBribe() {
    game.player.statistics.addExperience(125);
    game.player.inventory.addItemOfType("bottlecaps", 500);
  }

  matriarchTakeBribe() {
    game.player.statistics.addExperience(75);
    game.player.inventory.addItemOfType("bottlecaps", 100);
  }

  knowsAboutPotioks() {
    if (game.quests.hasQuest("cristal-den/bibins-potiok-assassination"))
      return true;
    return false; // TODO maybe more reasons ?
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
    return this.slaversErrandSlaveCost * this.slaversErrand.script.slavesDelivered;
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
    return this.sabotageWaterCarrierDied() || this.sabotageQuest.script.foughtWaterCarrier;
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

  sabotageHasSuitcaseEvidence() {
    return hasSuitcaseBeenOpened()
      && game.player.inventory.count("bibin-sabotage-suitcase") > 0
      && !this.sabotageKnowsAboutConfession();
  }

  sabotageReportSuitcaseEvidence() {
    this.sabotageQuest.script.onWaterCarrierConfessed();
    this.sabotageQuest.script.discoverBibinInvolvement();
    game.player.inventory.removeItemOfType("bibin-sabotage-suitcase");
  }

  giveSabotagePayment() {
    game.player.inventory.addItemOfType("bottlecaps", 100);
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
