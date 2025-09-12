import {skillContest} from "../../cmap/helpers/checks.mjs";

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  canIntimidate() {
    return !level.hasVariable("intimidated");
  }

  tryToIntimidate() {
    const success = game.player.statistics.level > this.dialog.npc.statistics.level
                 && skillContest(game.player, this.dialog.npc, "charisma", 3)
                 && skillContest(game.player, this.dialog.npc, "strength", 3);

    game.dataEngine.addReputation("cristal-den", -10 * (success ? 1 : 2));
    if (success) {
      level.setVariable("intimiated", 1);
      game.player.statistics.addExperience(15);
    }
    return success ? "intimiated" : "provoked";
  }

  markMap() {
    game.worldmap.revealCity("cristal-den");
  }

  startFight() {
    game.diplomacy.setAsEnemy(true, "player", "cristal-den");
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
