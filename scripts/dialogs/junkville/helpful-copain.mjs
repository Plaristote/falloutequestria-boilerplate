class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
    game.loadingScreenBackground = "helpful_copain";
  }

  getEntryPoint() {
    this.dialog.mood = "smile";
    return this.dialog.npc.hasVariable("met") ? "introduction" : "entry";
  }

  lowerReputation() {
    game.dataEngine.addReputation("junkville", -9);
  }

  joinPlayer() {
    this.dialog.npc.setScript("companions/helpful-copain.mjs");
    game.playerParty.addCharacter(this.dialog.npc);
  }

  nameGiven() {
    this.dialog.npc.setVariable("nameGiven", 1);
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
