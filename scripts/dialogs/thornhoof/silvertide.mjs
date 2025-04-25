export default class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
    this.dialog.npc.script.metPlayer = true;
  }

  giveCaravanQuest() {
    game.dataEngine.addReputation("thornhoof", 25);
    game.quests.addQuest("thornhoof/caravan");
    game.player.inventory.addItemOfType("quest-holodisk-hoarfrost");
  }

  rejectCaravanQuest() {
    game.dataEngine.addReputation("thornhoof", -15);
  }
}
