class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
    game.quests.getQuest("catch-mordino").completeObjective("speak-to-chief");
  }

  catchMordino() {
    game.quests.getQuest("catch-mordino").getScriptObject().startMordinoScene();
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
