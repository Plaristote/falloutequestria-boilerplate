import {requireQuest, QuestFlags} from "../../../quests/helpers.mjs";

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  getEntryPoint() {
    if (this.dialog.npc.script.intercepting) {
      this.dialog.npc.script.intercepting = false;
      return "intercept";
    }
  }

  startFight() {
    this.dialog.npc.setAsEnemy(game.player);
  }

  get scrollQuest() {
    return requireQuest("thornhoof/scrollQuest", QuestFlags.HiddenQuest);
  }

  hasScrollQuest() {
    return this.scrollQuest.inProgress && !this.scrollQuest.hidden;
  }

  hasLaboratoryKey() {
    return game.player.inventory.count("thornhoof-laboratory-key") > 0;
  }

  canJustifyIntercept() {
    return this.hasLaboratoryKey() && this.hasScrollQuest();
  }

  get scrollQuestCanScienceLie() {
    return game.player.statistics.science > 65 || game.player.statistics.repair > 65 || game.player.statistics.medicine > 70;
  }

  leaveLaboratory() {
    this.dialog.npc.script.intercepting = true;
    game.playerParty.insertIntoZone(level, "laboratory-front");
    level.findObject("laboratory.door#1").opened = false;
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
