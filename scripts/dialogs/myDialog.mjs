import {getValueFromRange} from "../behaviour/random.mjs";
import {skillContest} from "../cmap/helpers/checks.mjs";
import {DialogHelper} from "./helpers.mjs";

class Dialog extends DialogHelper {
  constructor(dialog) {
    super(dialog);
    console.log("LOADING TUTO DIALOG");
    this.dialog.npc.setVariable("startRoutine", 2);
  }

  getEntryPoint() {
    var state = 0;
    var entryPoints = ["entryPoint", "reentry", "victory"];

    if (this.dialog.npc.hasVariable("entryPoint"))
      state = this.dialog.npc.getVariable("entryPoint");
    return entryPoints[state];
  }

  onEntryPoint() {
    this.dialog.npc.setVariable("entryPoint", 1);
  }

  onHostileExit() {
    this.dialog.npc.setAsEnemy(this.dialog.player);
    return "";
  }

  onAngry() {
    this.dialog.mood = "angry";
  }

  onHostile() {
    this.setPersistentMood("angry");
  }

  onNeutral() {
    this.setPersistentMood("neutral");
  }

  onIntimidated() {
    this.dialog.mood = "sad";
    this.giveKey();
  }

  onStartFight() {
    this.onAngry();
    this.dialog.npc.setAsEnemy(this.dialog.player);
  }

  onHostileAndStartFight() {
    this.onHostile();
    this.onStartFight();
  }

  giveKey() {
    for (var i = 0 ; i < this.dialog.npc.inventory.items.length ; ++i) {
      const item = this.dialog.npc.inventory.items[i];

      if (item.itemType === "trialKey") {
        this.dialog.npc.inventory.removeItem(item);
        this.dialog.player.inventory.addItem(item);
        break ;
      }
    }
  }

  onVictory() {
    this.giveKey();
    if (this.dialog.mood === "angry")
      return i18n.t("dialogs.myDialog.victoryAngry");
    return i18n.t("dialogs.myDialog.victory");
  }

  canIntimidate() {
    return this.dialog.player.statistics.strength > this.dialog.npc.statistics.strength + 1;
  }

  canConvince() {
    return this.dialog.player.statistics.speech > 75;
  }

  tryToIntimidate() {
    const winner = skillContest(this.dialog.player, this.dialog.npc, 'strength', 3);

    if (winner === this.dialog.npc)
      return "hostileFightStart";
  }

  tryToConvince() {
    const winner = skillContest(this.dialog.player, this.dialog.npc, 'speech');

    if (winner === this.dialog.npc);
      return "dialoguePath#3";
  }

  tryToConvinceDifficult() {
    const winner = skillContest(this.dialog.player, { character: this.dialog.npc, bonus: 30 }, 'speech');

    if (roll > this.dialog.player.statistics.speech)
      return "dialoguePath#3";
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
