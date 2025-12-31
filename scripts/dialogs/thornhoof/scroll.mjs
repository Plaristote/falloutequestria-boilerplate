import {requireQuest, QuestFlags} from "../../quests/helpers.mjs";

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  getEntryPoint() {
    if (this.dialog.npc.hasVariable("dialogEntry")) {
      const value = this.dialog.npc.getVariable("dialogEntry");
      this.dialog.npc.unsetVariable("dialogEntry");
      return value;
    }
    if (this.dialog.npc.script.isInOffice)
      return "officeMeeting/entry";
  }

  onCouncilMeetingEntryResponse() {
    console.log("onCouncilMeetingEntryResponse starts");
    const quest = game.quests.getQuest("thornhoof/besiegedWalls");
    let mood = "neutral";
    let text;
    switch (this.dialog.previousAnswer) {
    case "meeting-heroic-1":
      text = this.dialog.t("councilMeeting/heroic-reaction");
      mood = "smile";
      game.dataEngine.addReputation("thornhoof", 15);
      break ;
    case "meeting-mercenary-1":
      text = this.dialog.t("councilMeeting/mercenary-reaction");
      mood = "smile";
      game.dataEngine.addReputation("thornhoof", -10);
      quest.setVariable("rewardAdvantage", 1);
      break ;
    case "meeting-pacifist-1":
      text = this.dialog.t("councilMeeting/pacifist-reaction");
      mood = "dubious";
      break ;
    case "meeting-sarcasm-1":
      text = this.dialog.t("councilMeeting/sarcasm-reaction");
      mood = "angry";
      break ;
    }
    if (level.hasVariable("councilMeetingInteractionWait")) {
      level.unsetVariable("councilMeetingInteractionWait");
      level.findGroup("townhall.council-room").script.meetingScene.triggerNextStep();
    }
    level.setVariable("councilMeetingInteractedWith", 1);
    return this.councilMeetingEntryResponseReaction(text, mood);
  }

  councilMeetingEntryResponseReaction(text, mood) {
    return {
      text: text,
      mood: mood,
      answers: [
        {
          symbol: "councilMeeting/next",
          textHook: function() { return "[…]"; },
          state: "councilMeeting/quest-intro"
        }
      ]
    };
  }

  councilMeetingOnQuestIntro() {
    game.quests.getQuest("thornhoof/besiegedWalls").script.startGroupedQuest();
    ["thornhoof-scroll", "thornhoof-leaf", "thornhoof-beryl", "thornhoof-varka", "hoarfrost"].forEach(name => {
      const script = level.findObject(name)?.script;
      if (script) script.shouldRunRoutine = true;
    });
  }

  get labQuest() {
    return requireQuest("thornhoof/scrollQuest", QuestFlags.HiddenQuest);
  }

  labQuestCanAsk() {
    return this.labQuest.hidden;
  }

  labQuestTryToStart() {
    const crystalQuest = game.quests.getQuest("thornhoof/crystalsQuest");
    const fightQuest = game.quests.getQuest("thornhoof/refugeesFight");

    if (fightQuest && fightQuest.completed)
      return "officeMeeting/lab-quest/intro";
    return "officeMeeting/not-ready";
  }

  labQuestTellAboutDangers() {
    this.labQuest.setVariable("toldAboutGhouls", 1);
  }

  labQuestTellAboutPastInIntro() {
    this.labQuest.setVariable("confessedInIntro", 1);
  }

  labQuestCanPress() {
    return game.player.statistics.intelligence >= 8 || game.player.statistics.speech >= 105;
  }

  labQuestCanPressFurther() {
    return this.labQuest.hasVariable("toldAboutGhouls") && game.player.statistics.intelligence >= 5;
  }

  labQuestCanNegociateExtra() {
    return this.labQuest.hasVariable("askedReward");
  }

  labQuestAskReward() {
    this.labQuest.setVariable("askedReward", 1);
  }

  get labQuestExtraPayment() {
    return 200;
  }

  get labQuestUpfrontPayment() {
    return 300;
  }

  get labQuestPayment() {
    return this.labQuest.script.capsReward;
  }

  labQuestCanBarterReward() {
    return game.player.statistics.barter > 74;
  }

  labQuestBarterReward() {
    game.player.inventory.addItemOfType("bottlecaps", this.labQuestUpfrontPayment);
  }

  labQuestAddExtraPayment() {
    this.labQuest.script.capsReward += this.labQuestExtraPayment;
  }

  labQuestAskedAboutReward() {
    this.labQuest.setVariable("askedReward", 1)
  }

  labQuestAccepted() {
    const key = this.dialog.npc.inventory.getItemOfType("thornhoof-laboratory-key");

    this.labQuest.hidden = false;
    if (key) {
      this.dialog.npc.inventory.removeItem(key);
      game.player.inventory.addItem(key);
    }
    game.player.inventory.addItemOfType("thornhoof-lab-quest-holodisk");
  }

  labQuestCanReport() {
    return this.labQuest.inProgress && game.player.inventory.count("thornhoof-laboratory-device");
  }

  labQuestPayReward() {
    game.player.inventory.addItemOfType("bottlecaps", this.labQuestPayment);
  }

  labQuestConfirmed() {
    game.player.inventory.removeItemOfType("thornhoof-laboratory-device");
    this.labQuest.completeObjective("report")
  }

  labQuestAskRewardText() {
    return this.dialog.t(
      this.labQuest.hasVariable("askedReward")
        ? "lab-quest/ask-reward-alt"
        : "lab-quest/ask-reward"
      );
  }

  get labQuestCanConfirmHolodiskTask() {
    return this.labQuest.isObjectiveCompleted("holodisk");
  }

  labQuestCanRejectHolodisk() {
    return !this.labQuest.isObjectiveCompleted("holodisk")
        && this.labQuest.hasVariable("foundScrollLogs"); // TODO maybe something else checking the logs were actually read
  }

  labQuestRejectHolodisk() {
    this.labQuest.setVariable("holodiskStatus", 1);
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
