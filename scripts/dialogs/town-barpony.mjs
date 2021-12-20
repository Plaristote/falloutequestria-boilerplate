class Dialog {
  constructor(dialog) {
    const storage = level.findObject("casino.game-room.bar-storage");

    this.dialog = dialog;
    this.dialog.barter.removeInventory(this.dialog.npc.inventory);
    this.dialog.barter.addInventory(storage.objectName, storage.inventory);
  }

  hasRobberQuest() {
    const object = game.quests.getQuest("catch-robber");

    return object && !object.isObjectiveCompleted("find");
  }
  
  workAvailable() {
    const object = game.quests.getQuest("catch-robber");
    
    return object == null;
  }

  startBarter() {
    this.dialog.tryToBarter();
    return this.dialog.t("start-barter");
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
