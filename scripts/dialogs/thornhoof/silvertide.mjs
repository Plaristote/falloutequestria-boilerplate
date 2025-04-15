export default class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  giveCaravanQuest() {
    game.dataEngine.addReputation("thornhoof", 25);
    game.quests.addQuest("thornhoof/caravan");
  }

  rejectCaravanQuest() {
    game.dataEngine.addReputation("thornhoof", -15);
  }
}
