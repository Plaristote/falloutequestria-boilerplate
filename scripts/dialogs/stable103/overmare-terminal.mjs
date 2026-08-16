import {SentinelOutcome} from "../../characters/rathian/flags.mjs";

export default class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  get rathianQuest() {
    return game.quests.getQuest("stable-103/rathian");
  }

  get overmare() {
    return level.script.overmare;
  }

  get sentinelOutcome() {
    return this.rathianQuest.getVariable("sentinelOutcome", 0);
  }

  get sentinelActivated() {
    return game.getVariable("sentinelActivated", null);
  }

  get isResolved() {
    return this.dialog.npc.script.resolved;
  }

  get overmareWillActivate() {
    return this.sentinelActivated === "overmare";
  }

  get playerCanActivate() {
    return this.sentinelOutcome === SentinelOutcome.AppliedToPlayer;
  }

  getEntryPoint() {
    if (this.isResolved)
      return "already-resolved";
    if (this.overmareWillActivate)
      return "overmare-activates/entry";
    if (this.playerCanActivate)
      return "player-options/entry";
    if (this.sentinelOutcome === SentinelOutcome.AppliedToRathian)
      return "not-yours/entry";
    return "nothing-to-do/entry";
  }

  resolve(ending) {
    this.dialog.npc.script.resolved = true;
    game.setVariable("gameEnding", ending);
    game.gameFinished();
  }

  overmareActivatesSentinel() {
    this.resolve("sentinel-overmare");
  }

  activateSentinelAsPlayer() {
    this.resolve("sentinel-player");
  }

  destroySentinelAtTerminal() {
    this.resolve("sentinel-destroyed");
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
