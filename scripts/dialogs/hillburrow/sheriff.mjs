import {
  initializeOldSheriffMurderQuest,
  hasOldSheriffMurderQuest,
  startWaterCarrierScene,
  isAfterVengeanceSpeechEnabled,
  onAfterVengeanceSpeechStarted
} from "../../quests/hillburrow/oldSheriffMurder.mjs";
import {
  saboteurShouldDisappear
} from "../../quests/hillburrow/sabotage.mjs";
import {isPlayerLookingForWaterCarrier} from "../../quests/cristal-den/bibins-sabotage-delivery.mjs";

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  getEntryPoint() {
    if (isAfterVengeanceSpeechEnabled(this.dialog.npc))
      return "quest-old-sheriff-arrestation/after-fight";
    return null;
  }

  get sheriffQuestReward() {
    return this.dialog.npc.getVariable("sheriffQuestRewardAmount", 150);
  }

  get sheriffQuest() {
    return game.quests.getQuest("hillburrow/oldSheriffMurder");
  }

  get sabotageQuest() {
    return game.quests.getQuest("hillburrow/sabotage");
  }

  get deliveryQuest() {
    return game.quests.getQuest("cristal-den/bibins-sabotage-delivery");
  }

  canAskAboutWaterCarrier() {
    return isPlayerLookingForWaterCarrier();
  }

  canNegociateSheriffQuestReward() {
    return this.dialog.player.statistics.barter > 75;
  }

  increaseSheriffQuestReward() {
    this.dialog.npc.setVariable("sheriffQuestRewardAmount", this.sheriffQuestReward * 2);
  }

  startOldSheriffQuest() {
    initializeOldSheriffMurderQuest();
  }

  loseTownReputation() {
    game.dataEngine.addReputation("hillburrow", -3);
  }

  onAskedForWork() {
    if (hasOldSheriffMurderQuest())
      return "no-more-work";
    return "quest-old-sheriff";
  }

  onNameGiven() {
    this.dialog.mood = "smile";
    if (!this.dialog.npc.hasVariable("knowsPlayerName")) {
      this.dialog.npc.setVariable("knowsPlayerName", 1);
      game.dataEngine.addReputation("hillburrow", 3);
      return "entry";
    }
    return "name-already-known";
  }

  oldSheriffMurderCanReportSheriffStar() {
    return game.player.inventory.count("quest-hillburrow-murder-evidence") > 0;
  }

  oldSheriffMurderCanReportMercenaries() {
    return this.sheriffQuest.getVariable("spokeToMercenaryBoss", 0) == 1;
  }

  oldSheriffMurderCanReportDrunkenMaster() {
    return this.sheriffQuest.isObjectiveCompleted("talkToDoctor") &&
           this.sheriffQuest.getVariable("leadsDrunkenMaster", 0) == 1;
  }

  isOldSheriffMurderQuestOngoing() {
    return this.sheriffQuest && this.sheriffQuest.inProgress;
  }

  oldSheriffSolveMurder() {
    this.sheriffQuest.completeObjective("solveMurder");
  }

  oldSheriffCompletion() {
    const inventory = this.dialog.player.inventory;
    const evidence = inventory.getItemOfType("quest-hillburrow-murder-evidence");

    inventory.addItemOfType("bottlecaps", this.sheriffQuestReward);
    if (evidence) {
      inventory.removeItem(evidence);
      this.dialog.npc.inventory.addItem(evidence);
    }
  }

  onAfterFightSpeech() {
    onAfterVengeanceSpeechStarted();
  }

  triggerOffscreenVengeance() {
    this.dialog.npc.setVariable("offscreenVengeance", 1);
    this.dialog.npc.tasks.addUniqueTask("offscreenVengeance", 3000, 0);
  }

  isWaterCarrierFightAvailable() {
    return this.isWaterCarrierAlive() && !saboteurShouldDisappear();
  }

  isWaterCarrierDead() {
    const waterCarrier = game.getCharacter("hillburrow/water-carrier");
    return !waterCarrier || !waterCarrier.isAlive();
  }

  isWaterCarrierAlive() {
    return !this.isWaterCarrierDead();
  }

  oldSheriffMurderCanSolve() {
    const sabotageQuest = game.quests.getQuest("hillburrow/sabotage");
    if (sabotageQuest)
      return sabotageQuest.isObjectiveCompleted("findCulprit") || sabotageQuest.script.knowsAboutBibinInvolvment;
    return false;
  }

  canStartVendetta() {
    const sabotageQuest = game.quests.getQuest("hillburrow/sabotage");
    return this.oldSheriffMurderCanSolve() && sabotageQuest.script.knowsAboutBibinInvolvment;
  }

  hasBibinDeliveryQuest() {
    return game.quests.hasQuest("cristal-den/bibins-sabotage-delivery");
  }

  knowsFullBibinStory() {
    const delivery = this.deliveryQuest;
    return (this.sabotageQuest && this.sabotageQuest.script.knowsAboutBibinInvolvment)
      || (delivery && delivery.isObjectiveCompleted("delivery"));
  }

  hasBibinSuspicionsOnly() {
    return game.hasVariable("knowsWaterCarrierBibinLink") && !this.knowsFullBibinStory();
  }

  canTellSheriffMoreAboutMurder() {
    return this.sheriffQuest
      && this.sheriffQuest.isObjectiveCompleted("solveMurder")
      && this.hasBibinDeliveryQuest()
      && !this.dialog.npc.hasVariable("toldSheriffAboutBibin");
  }

  onToldSheriffAboutBibin() {
    this.dialog.npc.setVariable("toldSheriffAboutBibin", 1);
  }

  isBibinAlive() {
    return !game.hasVariable("bibinDead");
  }

  isBibinDead() {
    return game.hasVariable("bibinDead");
  }

  canPersuadeSheriffToJoin() {
    return true;
  }

  attemptRecruitSheriff() {
    return game.hasVariable("bibinDead") || game.player.statistics.speech >= 100
        ? "old-sheriff-join-adventures-accept"
        : "old-sheriff-join-adventures-refuse";
  }

  startCompanionship() {
    game.playerParty.addCharacter(this.dialog.npc);
    level.addTextBubble(this.dialog.npc, this.dialog.t("on-start-companionship"), 3500, "green");
    this.dialog.npc.setScript("companions/sheriff.mjs");
    this.dialog.npc.script.startCompanionship();
  }

  startWaterCarrierAmbush() {
    level.script.startWaterCarrierAmbush = function() {
      game.switchToLevel("hillburrow-source", "vengeance-scene", startWaterCarrierScene);
    };
    level.tasks.addUniqueTask("startWaterCarrierAmbush", 1);
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
