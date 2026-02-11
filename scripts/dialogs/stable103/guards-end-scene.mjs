import {intimidateCheck} from "../../cmap/helpers/checks.mjs";

function isWithRathian() {
  const rathian = game.getCharacter("rathian");

  return game.playerParty.containsCharacter(rathian);
}

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
    this.guard = dialog.npc;
  }

  getEntryPoint() {
    if (isWithRathian())
      return "with-rathian";
    return "entry";
  }

  goingToOvermareHook() {
    if (isWithRathian()) {
      this.dialog.npc = game.getCharacter("rathian");
      return "rathian-interjects";
    }
    if (game.playerParty.list.length > 1)
      return "leave-friends";
    return this.goingToOvermare();
  }

  leaveCompanionsHook() {
    // TODO leave companion in a cell
    return this.goingToOvermare();
  }

  betrayRathianHook() {
    // TODO leave Rathian in a cell
    game.setVariable("rathianBetrayedAtStable", 1);
    this.dialog.npc = this.guard;
    return this.goingToOvermareHook();
  }

  goingToOvermare() {
    game.asyncAdvanceTime(3, function() {
      level.script.initializeEndGameScene();
    });
  }

  goToConflict() {
    this.dialog.npc = this.guard;
  }

  onIntimidate() {
    if (intimidateCheck(game.player, this.dialog.npc))
      level.setVariable("guardsIntimidated", 1);
    else
      this.startFight();
  }

  startFight() {
    game.diplomacy.setAsEnemy(true, "player", "stable-103");
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
