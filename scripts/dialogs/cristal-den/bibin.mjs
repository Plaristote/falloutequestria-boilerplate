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
    game.quests.addQuest("cristal-den/bibins-sabotage-delivery");
    game.player.inventory.addItemOfType("bibin-sabotage-suitcase");
  }

  onCompletedSabotageReport() {
    const quest = game.quests.getQuest("cristal-den/bibins-sabotage-delivery");
    quest.completeObjective("report");
    quest.completed = true;
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
    return this.sabotageDeliveryQuest != null && this.sabotageDeliveryQuest.isObjectiveCompleted("delivery");
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

  isNotWorkingForBibin() {
    return !this.isWorkingForBibin();
  }

  isWorkingForBibin() {
    return game.quests.getQuest("cristal-den/bibins-sabotage-delivery") != null;
  }

  backToPreviousContext() {
    return "job-proposal-return";
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
