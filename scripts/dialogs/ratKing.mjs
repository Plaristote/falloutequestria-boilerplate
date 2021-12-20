class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  setAsEnemy() {
    console.log("(!) Rat king iz now an enemy.");
    console.log("-> before:", this.dialog.npc.isEnemy(game.player));
    this.dialog.npc.setAsEnemy(game.player);
    console.log("-> after:", this.dialog.npc.isEnemy(game.player));
  }

  onBarterStart() {
    this.dialog.text = i18n.t("I've got nothing to trade with you.");
    return false;
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
