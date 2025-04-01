import {QuestFlags} from "../../../quests/helpers.mjs";

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
    this.loverQuest = game.quests.getQuest("capital/ghouls-love");
  }

  canBePolite() {
    return this.dialog.player.statistics.speech >= 67;
  }

  introduction() {
    switch (this.dialog.previousAnswer) {
    case "singer-compliment":
      return { textKey: "drinks-singer-compliment", mood: "smile" };
    case "exit-about-bar":
      return { textKey: "drinks-about-bar", mood: "smile" };
    case "back-to-intro":
      return { textKey: "drinks-back-to-intro" };
    }
  }

  drinks() {
    switch (this.dialog.previousAnswer) {
    case "ask-drink-politely":
      if (!this.dialog.npc.hasVariable("wasPolite")) {
        this.dialog.npc.setVariable("wasPolite", 1);
        game.dataEngine.addReputation("ash-aven", 15);
        return { text: this.dialog.t("drinks-polited") + "<br><br>" + this.dialog.t("drinks") };
      }
      break ;
    }
  }

  startGhoulLove() {
    if (!this.loverQuest)
      this.loverQuest = game.quests.addQuest("capital/ghouls-love", QuestFlags.HiddenQuest);
    return this.respondableEncourageConfession();
  }

  revealGhoulLove() {
    this.loverQuest.hidden = false;
  }

  ghoulLoveKnowsAboutFeelings() {
    return this.loverQuest && this.loverQuest.inProgress && this.loverQuest.isObjectiveCompleted("investigate");
  }

  ghoulLoveSuspicions() {
    if (this.dialog.previousAnswer == "ghoul-love-sure-about-suspicions")
      return { textKey: "ghoul-love/shrug", mood: "neutral" };
    return this.respondableEncourageConfession();
  }

  respondableEncourageConfession() {
    switch (this.dialog.previousAnswer) {
      case "love-encourage-confession":
      case "love-encourage-confession-alt":
        return { textKey: "ghoul-love/encouraged-confession", mood: "neutral" };
    }
    return null;
  }

  ghoulLoveCompleted() {
    this.loverQuest.completeObjective("mediate");
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
