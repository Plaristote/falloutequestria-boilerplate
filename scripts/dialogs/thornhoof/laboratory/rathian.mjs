import {States} from "../../../characters/rathian/thornhoof-laboratory-quest.mjs";
import {SentinelOutcome} from "../../../characters/rathian/flags.mjs";

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

  canDiscussSentinelFate() {
    return this.quest.hasVariable("rathianConvinced")
      && !this.quest.hasVariable("sentinelOutcome");
  }

  destroySentinelWithRathian() {
    const terminal = level.findObject("2.laboratory.terminal#1");

    terminal.script.sentinelResolved = true;
    this.quest.setVariable("sentinelOutcome", SentinelOutcome.Destroyed);
    this.quest.setVariable("rathianConsented", 1);
    this.quest.completeObjective("dealWithRathian");
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
