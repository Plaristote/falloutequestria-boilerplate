class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  get refugeesFightQuest() {
    return game.quests.getQuest("thornhoof/refugeesFight");
  }

  canAskAboutRefugeeFight() {
    return this.refugeesFightQuest != null;
  }

  canAskAboutRefugees() {
    return true;
  }

  canAskAboutRefugeeWound() {
    return this.refugeesFightQuest.script.woundedRefugeeKnowledge >= 1;
  }

  canAskFightFollowUp1() {
    return this.dialog.previousAnswer.startsWith("refugees/fight/answer-ask-fight");
  }

  canAskFightFollowUp2() {
    return this.dialog.previousAnswer == "refugees/fight/answer-fight-followup#1";
  }

  refugeesFightAboutFight() {
    switch (this.dialog.previousAnswer) {
      case "refugees/fight/answer-fight-followup#1":
        this.refugeesFightQuest.script.woundedRefugeeKnowledge = 1;
        return { textKey: "refugees/fight/about-flee", mood: "cocky" };
      case "refugees/fight/answer-fight-followup#2":
        return { textKey: "refugees/fight/about-following", mood: "sad" };
    }
  }

  refugeesFightAboutWoundedRefugee() {
    this.refugeesFightQuest.script.woundedRefugeeKnowledge = 2;
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
