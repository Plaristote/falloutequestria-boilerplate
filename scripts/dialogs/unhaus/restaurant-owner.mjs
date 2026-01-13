class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  prompt() {
    switch (this.dialog.previousAnswer) {
    case "ask-about-insects":
      return { textKey: "about-insects", mood: "smile" };
    case "fix-restaurant-formulation":
      return { textKey: "restaurant-fix", mood: "smile" };
    case "ask-about-wares":
      return { textKey: "other-wares", mood: "neutral" };
    case "ask-reveal-changeling":
      return { textKey: "revealed", mood: "sad" };
    case "ask-about-restaurant-location":
      return { textKey: "about-hallway", mood: "neutral" };
    }
  }

  get changelingQuest() {
    return game.quests.getQuest("changelingQuest");
  }

  get canAskAboutInsectPony() {
    return this.changelingQuest
        && this.changelingQuest.isObjectiveCompleted("findAboutUnhaus")
        && !this.changelingQuest.isObjectiveCompleted("findLair");
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
