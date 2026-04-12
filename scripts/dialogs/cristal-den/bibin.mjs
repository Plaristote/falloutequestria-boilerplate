import {QuestHelper, QuestFlags, requireQuest} from "../../quests/helpers.mjs";
import {skillContest} from "../../cmap/helpers/checks.mjs";

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
    this.meetingQuest = requireQuest("cristal-den/bibins-meeting");
    if (!this.meetingQuest.completed)
      this.meetingQuest.completeObjective("talkToBibin");
  }

  getEntryPoint() {
    if (!this.meetingQuest.completed) {
      this.meetingQuest.hidden = false;
      this.meetingQuest.completed = true;
      if (this.meetingQuest.isObjectiveCompleted("catchBibinAttention"))
        return "entry/caught-attention";
      return "entry/intruding";
    }
  }

  callGuards() {
    const guard = level.findObject("hostel.guards.floor-1.guard#1");
    const actions = guard.actionQueue;

    this.dialog.npc.setAsEnemy(game.player);
    game.player.setAsEnemy(this.dialog.npc);
    game.dataEngine.addReputation("bibins-band", -200);
    actions.reset();
    actions.pushReach(game.player);
    actions.start();
  }

  isSaboteurDead() {
    const saboteur = game.getCharacter("hillburrow/water-carrier");
    return !(saboteur && saboteur.isAlive());
  }

  onAcceptedSabotageJob() {
    game.worldmap.revealCity("hillburrow");
    game.quests.addQuest("cristal-den/bibins-sabotage-delivery");
    game.player.inventory.addItemOfType("bibin-sabotage-suitcase");
  }

  onCompletedSabotageReport() {
    this.sabotageDeliveryQuest.setVariable("gavePassword", 1);
    this.sabotageDeliveryQuest.completeObjective("report");
    this.sabotageDeliveryQuest.completed = true;
  }

  onFailedSabotageReport() {
    this.sabotageDeliveryQuest.setVariable("gavePassword", 0);
    this.sabotageDeliveryQuest.completeObjective("report");
    this.sabotageDeliveryQuest.failed = true;
    this.callGuards();
  }

  onAskedRewardSabotageJob() {
    this.sabotageReward = this.increasedSabotageReward;
    return "sabotage/accept-payment";
  }

  onNegociateSabotageJob() {
    if (skillContest(game.player, this.dialog.npc, "barter") == game.player) {
      this.sabotageReward = this.increasedSabotageReward;
      return "sabotage/accept-more-payment";
    }
    return "sabotage/reject-more-payment";
  }

  onSabotageReceivedReward() {
    game.player.inventory.addItemOfType("bottlecaps", this.sabotageReward);
  }

  get sabotageDeliveryQuest() {
    return game.quests.getQuest("cristal-den/bibins-sabotage-delivery");
  }

  canReportOnSabotageJob() {
    return this.sabotageDeliveryQuest != null
      && this.sabotageDeliveryQuest.isObjectiveCompleted("delivery")
      && !this.sabotageDeliveryQuest.isObjectiveCompleted("report");
  }

  canReportOnSabotagePassword() {
    return this.sabotageDeliveryQuest.isObjectiveCompleted("ask-password");
  }

  waterCarrierKilledByPotioks() {
    const quest = game.quests.getQuest("hillburrow/sabotage");
    return quest && (quest.script.foughtWaterCarrier || quest.script.potiokKilledWaterCarrier);
  }

  lieAboutWaterCarrierDeath() {
    const winner = skillContest(game.player, this.dialog.npc, "speech", 15);
    return winner == game.player ? "sabotage/water-carrier-death-peaceful-end" : "sabotage/water-carrier-death-insulted";
  }

  canAskSabotageReward() {
    return this.sabotageReward > 0;
  }

  get increasedSabotageReward() {
    return this.sabotageReward + 100;
  }

  get sabotageReward() {
    return this.dialog.npc.getVariable("sabotage-delivery-reward", 0);
  }

  set sabotageReward(value) {
    this.dialog.npc.setVariable("sabotage-delivery-reward", value);
  }

  get increasedSabotageReward() {
    return this.enforcersReward + 250;
  }

  get enforcersReward() {
    return this.dialog.npc.getVariable("enforcers-reward", 600);
  }

  set enforcersReward(value) {
    this.dialog.npc.setVariable("enforcers-reward", value);
  }

  get rescueReward() {
    return this.enforcersReward; // TODO ?
  }

  get enforcersQuest() {
    return game.quests.getQuest("cristal-den/bibins-enforcers-sabotage");
  }

  onEnforcersJobAccepted() {
    game.quests.addQuest("cristal-den/bibins-enforcers-sabotage");
    game.player.inventory.addItemOfType("dynamite");
  }

  canReportOnEnforcersJob() {
    return this.enforcersQuest && this.enforcersQuest.isObjectiveCompleted("destroyedStash");
  }

  onEnforcersJobReport() {
    this.enforcersQuest.completed = true;
    game.player.inventory.addItemOfType("bottlecaps", this.enforcersReward);
  }

  isNotWorkingForBibin() {
    return !this.isWorkingForBibin();
  }

  isWorkingForBibin() {
    return game.quests.getQuest("cristal-den/bibins-sabotage-delivery") != null;
  }

  canStartSecondQuest() {
    return this.sabotageDeliveryQuest != null && this.sabotageDeliveryQuest.completed
        && (this.enforcersQuest == null || this.enforcersQuest.hidden);
  }

  get potiokSpyQuest() {
    return game.quests.getQuest("cristal-den/potioks-spy");
  }

  get rescueHerdQuest() {
    return game.quests.getQuest("cristal-den/bibins-rescue-herd");
  }

  onRescueQuestAccepted() {
    game.quests.addQuest("cristal-den/bibins-rescue-herd");
  }

  reportRescueQuest() {
    if (this.rescueHerdQuest.isObjectiveCompleted("rescue"))
      return "pinnedHerd/report-success";
    return "pinnedHerd/report-failure";
  }

  onReportRescueQuest() {
    this.rescueHerdQuest.completed = true;
    this.rescueHerdQuest.completeObjective("report");
    game.player.inventory.addItemOfType("bottlecaps", this.rescueReward);
  }

  onReportFailedRescueQuest() {
    this.rescueHerdQuest.completeObjective("report");
  }

  canAskAboutGoldenHerdFriends() {
    const knowsConnection =
            (this.rescueHerdQuest && this.rescueHerdQuest.isObjectiveCrossedOff("rescue"))
         || (this.potiokSpyQuest && this.potiokSpyQuest.isObjectiveCompleted("learnAboutSavageConnection"));
    return knowsConnection && game.dataEngine.hasReputation("golden-herd");
  }

  canAskAboutThornhoofSiege() {
    const liftQuest = game.quests.getQuest("thornhoof/besiegedWalls");
    return game.quests.hasQuest("thornhoof/caravan") && (!liftQuest || !liftQuest.completed);
  }

  canReportOnRescueQuest() {
    return this.rescueHerdQuest != null && this.rescueHerdQuest.isObjectiveCrossedOff("rescue")
        && !this.rescueHerdQuest.isObjectiveCompleted("report");
  }

  canStartThirdQuest() {
    return this.enforcersQuest != null && this.enforcersQuest.completed
        && (this.rescueHerdQuest == null || this.rescueHerdQuest.hidden);
  }

  canStartNextQuest() {
    return this.canStartSecondQuest() || this.canStartThirdQuest();
  }

  goToNextQuestIntroState() {
    if (this.canStartSecondQuest())
      return "enforcers/intro";
    else if (this.canStartThirdQuest())
      return "pinnedHerd/intro";
    return null;
  }

  backToPreviousContext() {
    return "job-proposal-return";
  }

  // Herd talk
  herdPrompt() {
    switch (this.dialog.previousAnswer) {
    case "herd-ask-about-thornhoof":
      return { textKey: "about-herd/about-thornhoof", mood: "cocky" };
    case "ask-about-golden-herd":
    case "rescue-bring-up-golden-herd":
      return { textKey: "about-herd/intro", mood: "cocky" };
    case "herd-give-positive-opinion":
      return { textKey: "about-herd/about-strong-herd", mood: "smile" };
    }
  }

  onHerdCooperationAccepted() {
    // TODO ?
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
