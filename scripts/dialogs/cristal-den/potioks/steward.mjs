import {skillCheck} from "../../../cmap/helpers/checks.mjs"

class Dialog {
  constructor(dialog) {
    console.log("CONSTRUCTED PAT POTIOK DIALOG");
    this.dialog = dialog;
  }

  aboutPotioks() {
    switch (this.dialog.lastAnswer) {
      case "ask-about-potiok-control":
        this.mood = "cocky";
        return this.tr("about-potioks-control");
      case "ask-about-potiok-rumors":
        this.mood = "angry";
        return this.tr("about-potioks-rumors");
    }
  }

  hasHeardPotiokRumors() {
    return true;
  }

  recruitTestPassed() {
    if (level.getVariable("access", 0) < 2)
      level.setVariable("access", 2);
    level.setVariable("canAskForWork", 0);
  }

  recruitBluff() {
    if (skillCheck(game.player, "speech", { target: 130 })) {
      game.playerParty.addExperience(25);
      return "recruitment/success";
    }
  }

  onPassingThrough() {
    if (level.getVariable("access", 0) < 2)
      return "send-away";
    return "";
  }

  canAskForWork() {
    return level.getVariable("canAskForWork", 1) === 1;
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
