class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }
  
  canAskHints() {
    return game.player.statistics.speech >= 70;
  }

  askTownDetails() {
    const data = game.quests.getQuest("catch-mordino");

    console.log("askTownDetails", data && data.completed);
    if (data && data.completed) {
      this.dialog.mood = "smile";
      return "crime-mordino-thanks";
    }
    this.dialog.mood = "angry";
    return "hints-intro";
  }

  goNeutral() {
    this.dialog.mood = "neutral";
  }

  hasWitnessedCrime() {
    return this.hasWitnessedMurderAtMordinos();
  }

  hasWitnessedMurderAtMordinos() {
    const data = game.quests.getQuest("catch-robber");
    const data2 = game.quests.hasQuest("catch-mordino");

    console.log("hasWitnessedMurderAtMordinos", data2);
    return data && data.isObjectiveCompleted("bring") && !data2;
  }
  
  accessToSheriff() {
    game.quests.addQuest("catch-mordino");
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
