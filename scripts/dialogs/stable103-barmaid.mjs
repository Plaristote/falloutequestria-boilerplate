class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }
  
  entryPoint() {
    if (this.entryLine) {
      delete this.entryLine;
      return this.dialog.t(this.entryLine);
    }
  }
  
  drankCider() {
    const quest = quests.getQuest("stable-party");
    if (!quest)
      return "partyPlanIntro";
    else
      this.entryLine = "poured-cider";
  }
  
  drankAppleJuice() {
    this.entryLine = "poured-juice";
  }

  startPartyQuest() {
    quests.addQuest("stable-party");
  }

  canGivePartyBottles() {
    const quest = quests.getQuest("stable-party");
    return quest && quest.inProgress && this.hasPartyBottles();
  }

  hasPartyBottles() {
    const quest = quests.getQuest("stable-party");
    if (quest)
      return quest.script.hasEnoughBottles();
    return false;
  }

  givePartyBottles() {
    quests.getQuest("stable-party").script.giveBottles();
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
