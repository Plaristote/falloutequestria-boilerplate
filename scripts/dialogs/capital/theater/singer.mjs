class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
    this.loverQuest = game.quests.getQuest("capital/ghouls-love");
  }

  getEntryPoint() {
    if (this.dialog.npc.hasVariable("met"))
      return "entry";
    this.dialog.npc.setVariable("met", 1);
    return "introduction";
  }

  hasLoversQuest() { return this.loverQuest && this.loverQuest.inProgress; }
  canSpeakInRhymes() { return this.dialog.player.statistics.speech > 84; }
  onComplimented() { game.dataEngine.addReputation("ash-aven", 15); }
  onDisrespected() { game.dataEngine.addReputation("ash-aven", -15); }
  onFlirted() { this.onComplimented(); this.dialog.npc.setVariable("flirted", 1); }
  canFlirt() { return !this.dialog.npc.hasVariable("flirted"); }
  onFlirtedAgain() {
    if (this.dialog.npc.hasVariable("flirted2")) { this.onComplimented(); }
    this.dialog.npc.setVariable("flirted2", 1);
  }

  aboutSelf() {
    switch (this.dialog.previousAnswer) {
      case "compliment-voice": return { textKey: "complimented", mood: "laugh" };
      case "ask-about-self":   return { textKey: "about-self",   mood: "smile"};
      case "ask-about-town":   return { textKey: "about-town",   mood: "sad"};
    }
    return { textKey: "about" };
  }

  loveIntro() {
    if (this.dialog.previousAnswer == "love-compliment")
      return { textKey: "love-quest/complimented", mood: "laugh" };
  }

  lovePressed() {
    switch (this.dialog.previousAnswer) {
      case "love-guess-founder": return { textKey: "love-guessed-founder", mood: "smile" };
      case "love-guess-self":    return { textKey: "love-guessed-self", mood: "laugh" };
    }
  }

  loveGuessed() {
    this.loverQuest.completeObjective("investigate");
  }

  loveTriggerConfession() {
    this.loverQuest.setVariable("discreet", 1);
    this.loverQuest.completeObjective("mediate");
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
