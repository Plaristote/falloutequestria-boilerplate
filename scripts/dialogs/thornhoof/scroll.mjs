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
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
