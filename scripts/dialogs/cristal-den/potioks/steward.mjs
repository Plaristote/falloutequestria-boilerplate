import {skillCheck} from "../../../cmap/helpers/checks.mjs"

class Dialog {
  constructor(dialog) {
    console.log("CONSTRUCTED PAT POTIOK DIALOG");
    this.dialog = dialog;
  }

  aboutPotioks() {
    switch (this.dialog.previousAnswer) {
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
    level.setVariable("sentByPat", 1);
  }

  recruitPitchSneak() {
    const stealth = game.player.statistics.stealth;
    const reputation = game.dataEngine.getReputation("cristal-den");
    const neutral = reputation > -20 && reputation < 20;
    const neutralAndCompetent = stealth >= 55 && neutral;

    if (stealth >= 80 || neutralAndCompetent)
      return "recruitment/success";
    if (neutral)
      return "recruitment/failure-conspicuous";
    return "recruitment/failure";
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
    return !level.hasVariable("sentByPat");
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
