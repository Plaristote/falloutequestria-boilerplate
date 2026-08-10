import {skillCheck} from "../../../cmap/helpers/checks.mjs";
import {requireQuest, QuestFlags} from "../../../quests/helpers.mjs";

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  get quest() {
    return requireQuest("cristal-den/bibins-rescue-herd", QuestFlags.HiddenQuest);
  }

  get outpostQuest() {
    return game.quests.getQuest("cristal-den/copper-outpost");
  }

  get knowsGoldenHerd() {
    return this.outpostQuest != null && this.outpostQuest.getVariable("full-report", 0) == 2;
  }

  get goldenHerdBrokenAtThornhoof() {
    return game.getVariable("goldenHerdDestroyedAtThornhoof", 0) == 1;
  }

  getEntryPoint() {
    this.dialog.npc.setVariable("met", 1);
    this.quest.script.pushUniqueEvent("desc-met-enforcer");

    if (this.herdKilled)
      return this.hasLeftAfterHerdKilled ? "herd-dead-aftermath" : "herd-dead";
    if (this.hasWithdrawn)
      return "withdrawn";
    if (this.quest.isObjectiveCrossedOff("kill-scouts"))
      return "scouts-dead";
  }

  get herdKilled() {
    return this.quest.isObjectiveFailed("rescue");
  }

  get hasWithdrawn() {
    return this.dialog.npc.hasVariable("withdrawn");
  }

  set hasWithdrawn(value) {
    value ? this.dialog.npc.setVariable("withdrawn", 1) : this.dialog.npc.unsetVariable("withdrawn");
  }

  get persuadeAttempted() {
    return this.dialog.npc.hasVariable("persuadeAttempted");
  }

  set persuadeAttempted(value) {
    value ? this.dialog.npc.setVariable("persuadeAttempted", 1) : this.dialog.npc.unsetVariable("persuadeAttempted");
  }

  get hasLeftAfterHerdKilled() {
    return this.dialog.npc.hasVariable("leftAfterHerdKilled");
  }

  set hasLeftAfterHerdKilled(value) {
    value ? this.dialog.npc.setVariable("leftAfterHerdKilled", 1) : this.dialog.npc.unsetVariable("leftAfterHerdKilled");
  }

  onAskOrders() {
  }

  avengeSquad() {
    this.dialog.npc.setAsEnemy(game.player);
    game.player.setAsEnemy(this.dialog.npc);
  }

  canOfferToNegotiate() {
    return !this.hasWithdrawn && !this.persuadeAttempted;
  }

  onAcceptNegotiator() {
    game.setVariable("cristalDenSiegeSentAsNegotiator", 1);
    this.quest.script.pushUniqueEvent("desc-sent-as-negotiator");
  }

  attemptPersuade() {
    if (this.hasWithdrawn)
      return "withdrawn";
    if (this.persuadeAttempted)
      return "persuade/already-tried";

    this.persuadeAttempted = true;

    if (this.knowsGoldenHerd && !this.goldenHerdBrokenAtThornhoof) {
      this.quest.script.pushUniqueEvent("desc-persuade-refused-known-threat");
      return "persuade/refuse-known-threat";
    }

    const dc = this.knowsGoldenHerd ? 150 : 125;
    const winner = skillCheck(game.player, "speech", { target: dc });
    if (winner == game.player) {
      this.quest.script.pushUniqueEvent("desc-enforcers-persuaded");
      this.onWithdraw();
      return "persuade/success";
    }
    this.quest.script.pushUniqueEvent("desc-persuade-failed");
    return "persuade/failure";
  }

  get bribeCost() {
    const base = this.knowsGoldenHerd ? 5000 : 1500;
    return game.player.statistics.barter > 75 ? base / 2 : base;
  }

  canOfferBribe() {
    return !this.hasWithdrawn;
  }

  attemptBribe() {
    if (game.player.inventory.count("bottlecaps") < this.bribeCost)
      return "bribe/too-poor";
    return "bribe/confirm";
  }

  payBribe() {
    game.player.inventory.removeItemOfType("bottlecaps", this.bribeCost);
    this.quest.script.pushUniqueEvent("desc-enforcers-bribed");
    this.onWithdraw();
  }

  sendToNegotiate() {
    this.quest.setVariable("sentToNegotiate", 1);
  }

  onHerdDeadReaction() {
    this.hasLeftAfterHerdKilled = true;
    this.quest.script.pushUniqueEvent("desc-herd-killed");

    const scouts = level.findGroup("scouts");
    if (scouts)
      scouts.objects.forEach(character => character.script.goToLevelExit());
    this.dialog.npc.script.goToLevelExit();
  }

  onWithdraw() {
    this.hasWithdrawn = true;
    this.quest.script.enforcersWithdrewPeacefully = true;

    game.setVariable("cristalDenSiegeSergeantWithdrew", 1);
    if (this.knowsGoldenHerd)
      game.setVariable("cristalDenSiegeLetGoldenHerdGo", 1);

    const scouts = level.findGroup("scouts");
    if (scouts)
      scouts.objects.forEach(character => character.script.goToLevelExit());
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}

