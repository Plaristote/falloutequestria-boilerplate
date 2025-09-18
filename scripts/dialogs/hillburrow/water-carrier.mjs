import {QuestFlags, requireQuest} from "../../quests/helpers.mjs";
import * as Checks from "../../cmap/helpers/checks.mjs";

function triggerWaterCarrierLeadInSheriffQuest(self) {
  const quest    = self.sheriffMurderQuest;
  const event    = "talkedWithWaterCarrier";
  const eventAlt = "talkedWithWaterCarrierAlt";
  if (quest && self.dialog.npc.hasVariable("identity-known")) {

    if (quest.script.hasEvent("foundSheriffStarAlt")) {
      if (!quest.script.hasEvent(eventAlt)) quest.script.pushEvent(eventAlt);
      return ;
    }

    if (quest.script.hasEvent("doctorsAdvice")) {
      if (!quest.script.hasEvent(event)) quest.script.pushEvent(event);
      return ;
    }
  }
}

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
    triggerWaterCarrierLeadInSheriffQuest(this);
  }

  get sabotageQuest() {
    return game.quests.getQuest("hillburrow/sabotage");
  }

  get deliveryQuest() {
    return game.quests.getQuest("cristal-den/bibins-sabotage-delivery");
  }

  get sheriffMurderQuest() {
    return game.quests.getQuest("hillburrow/oldSheriffMurder");
  }

  get identityKnown() {
    return this.dialog.npc.hasVariable("identity-known");
  }

  onLearnedIdentity() {
    this.dialog.npc.setVariable("identity-known", 1);
    triggerWaterCarrierLeadInSheriffQuest(this);
  }

  dynamiteHasBeenFound() {
    const quest = requireQuest("hillburrow/sabotage", QuestFlags.HiddenQuest);
    return quest.isObjectiveCompleted("findWaterCarrierDynamite");
  }

  canAskAboutSabotage() {
    return this.sabotageQuest && !this.sabotageQuest.hidden;
  }

  intimidationAttempt() {
    const winner = Checks.skillContest(game.player, this.dialog.npc, "strength", 3);

    return `sabotage-intimidation-${winner == game.player ? "success" : "fail"}`;
  }

  canConvinceToConfess() {
    return this.dialog.player.statistics.speech >= 89;
  }

  findOutDynamiteFromNpc() {
    const quest = game.quests.addQuest("hillburrow/sabotage", QuestFlags.HiddenQuest);
    quest.completeObjective("findSuspect");
  }

  onConfessionHeard() {
    this.sabotageQuest.script.onWaterCarrierConfessed();
  }

  onLearnAboutBibinInvolvment() {
    this.sabotageQuest.setVariable("bibinFoundOut", 1);
  }

  startFight() {
    this.sabotageQuest.script.foughtWaterCarrier = true;
    this.dialog.npc.statistics.faction = "";
    this.dialog.npc.setAsEnemy(game.player);
  }

  takeToPotiokBoss() {
    this.sabotageQuest.script.startWaterCarrierScene();
  }

  hasBibinDeliveryQuest() {
    return this.identityKnown && this.deliveryQuest && game.player.inventory.count("bibin-sabotage-suitcase") > 0;
  }

  onDeliveryDone() {
    const suitcase = game.player.inventory.getItemOfType("bibin-sabotage-suitcase");

    suitcase.script.useOn(this.dialog.npc);
    game.player.inventory.destroyItem(suitcase);
    this.deliveryQuest.completeObjective("delivery");
  }

  deliveryTryToLearnSuitcaseContents() {
    const winner = Checks.skillContest(game.player, this.dialog.npc, "speech", 20);
    return winner == game.player ? "delivery-contents-success" : "delivery-contents-failure";
  }

  onDeliveryLearnedSuitcaseContents() {
    this.dynamiteHasBeenFound();
    this.onLearnAboutBibinInvolvment();
  }

  canAskDeliveryPassword() {
    return !this.deliveryQuest.isObjectiveCompleted("ask-password");
  }

  onDeliveryLearnedPassword() {
    this.deliveryQuest.completeObjective("ask-password");
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
