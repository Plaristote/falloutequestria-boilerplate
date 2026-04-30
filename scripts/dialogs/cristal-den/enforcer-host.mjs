import {areDenSlaversDead} from "../../characters/cristal-den/slavers/denSlaversDead.mjs";

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  onAskAboutPlace() {
    if (areDenSlaversDead() && this.askAboutPlaceUseDenSlaverIntro())
      return "on-trouble-slavers-wiped-out";
    if (game.dataEngine.getReputation("cristal-den") < 25)
      return "on-trouble-bad-rep";
    return "on-trouble";
  }

  askAboutPlaceUseDenSlaverIntro() {
    if (!this.dialog.npc.hasVariable("aboutDenSlavers")) {
      this.dialog.npc.setVariable("aboutDenSlavers", 1);
      return true;
    }
    return false;
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
