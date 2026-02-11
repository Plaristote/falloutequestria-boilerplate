class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  get bookQuest() {
    return game.quests.getQuest("stable-103/bookCollect");
  }

  tryToTriggerBookQuest() {
    if (!this.bookQuest)
      return "bookCollect/intro";
  }

  triggerBookQuest() {
    game.quests.addQuest("stable-103/bookCollect");
  }

  canCompleteBookQuest() {
    return this.bookQuest && this.bookQuest.script.hasEnoughBooks();
  }

  completeBookQuest() {
    this.bookQuest.script.giveBooks();
  }

  onSarcasm() {
    game.dataEngine.addReputation("stable-103", -5);
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
