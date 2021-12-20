import {Dialog} from "./town-hotel-owner.mjs";

class SubDialog extends Dialog {
  constructor(dialog) {
    super(dialog);
    this.dialog = dialog;
  }

  getEntryPoint() {
    return "intro";
  }
  
  giveReward() {
    this.dialog.mood = "smile";
    game.player.inventory.addItemOfType("bottlecaps", 300);
  }
}

export function create(dialog) {
  return new SubDialog(dialog);
}
