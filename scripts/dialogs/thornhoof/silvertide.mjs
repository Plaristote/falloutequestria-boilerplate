import {DialogHelper} from "../helpers.mjs";

export default class extends DialogHelper {
  get caravanQuest() {
    return game.quests.getQuest("thornhoof/caravan");
  }

  getEntryPoint() {
    if (this.firstMeetingCheck())
      return "meeting/introduction";
    else if (!this.caravanQuest)
      return "meeting/re-entry";
    else if (this.caravanQuest && this.caravanQuest.isObjectiveCompleted("lead-caravan") && !this.caravanQuest.isObjectiveCompleted("report")) {
      if (!this.caravanQuest.isObjectiveCompleted("steel-rangers-shipment"))
        return "caravan-arrival/failure-entry";
      return "caravan-arrival/success-entry";
    }
    return "entry";
  }

  giveCaravanQuest() {
    game.dataEngine.addReputation("thornhoof", 25);
    game.quests.addQuest("thornhoof/caravan");
    game.player.inventory.addItemOfType("quest-holodisk-hoarfrost");
  }

  rejectCaravanQuest() {
    game.dataEngine.addReputation("thornhoof", -15);
  }

  get successEntryLauriePart() {
    if (game.getCharacter("cristal-den/caravan-leader").isAlive())
      return this.dialog.t("success-entry+laurie");
    return "";
  }

  get canClaimAdvanceOnCaravan() {
    return this.caravanQuest.script.playerAdvanceAmount > 0;
  }

  get canClaimCaravanReward() {
    return !this.caravanScript.script.playerReceivedReward;
  }

  get canNegociateCaravanReward() {
    return game.player.statistics.barter > 67;
  }

  get caravanPlayerAdvanceAmount() {
    return this.caravanQuest.script.playerAdvanceAmount;
  }

  refundCaravan() {
    game.player.inventory.addItemOfType("bottlecaps", this.caravanPlayerAdvanceAmount);
    this.caravanQuest.script.playerAdvanceAmount = 0;
  }

  rewardCaravan() {
    game.player.inventory.addItemOfType("bottlecaps", this.caravanReward);
    this.caravanQuest.script.playerReceivedReward = true;
  }

  rewardCaravanNegociated() {
    game.player.inventory.addItemOfType("bottlecaps", this.caravanRewardNegociated);
  }

  get caravanReward() { return 300; }
  get caravanRewardNegociated() { return 200; }

  get canLieAboutCaravanAmmoFailure() {
    return game.player.statistics.speech >= 82;
  }

  get cannotLieAboutCaravanAmmoFailure() {
    return game.player.statistics.speech < 82;
  }

  caravanQuestCompleted() {
    this.caravanQuest.completeObjective("report");
    this.caravanQuest.completed = true;
    level.findObject("checkpoint.gate#1").locked = false;
  }

  caravanQuestFailed() {
    game.dataEngine.addReputation("thornhoof", -175);
    this.caravanQuest.completeObjective("report");
    this.caravanQuest.failed = true;
  }

  entryText() {
    if (game.dataEngine.getReputation("thornhoof") > 100)
      return { textKey: "entry-liked" };
    return { textKey: "entry" };
  }
}
