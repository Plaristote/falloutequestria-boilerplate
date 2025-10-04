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
}

export function create(dialog) {
  return new Dialog(dialog);
}
