import {States} from "../../../characters/rathian/thornhoof-laboratory-quest.mjs";

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  get isWaiting() {
    return this.dialog.npc.state == States.Waiting;
  }

  get canWaitHere() {
    return this.dialog.npc.hasVariable("canWaitAtThornhoofLaboratory");
  }

  set canWaitHere(value) {
    return this.dialog.npc.setVariable("canWaitAtThornhoofLaboratory", value);
  }

  letsGo() {
    if (this.isWaiting)
      this.dialog.npc.state = States.Default;
  }

  waitHere() {
    if (this.canWaitHere)
      this.dialog.npc.state = States.Waiting;
    else
      return "about-waiting/entry";
  }

  canConvinceToWait() {
    return game.player.statistics.speech >= 60;
  }

  onConvincedToWait() {
    this.canWaitHere = 1;
    this.letsGo();
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
