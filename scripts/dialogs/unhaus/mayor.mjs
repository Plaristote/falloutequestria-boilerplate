import {DialogHelper} from "../helpers.mjs";

export default class extends DialogHelper {
  constructor(dialog) {
    super(dialog);
  }

  getEntryPoint() {
    game.setVariable("metUnhausMayor", 1);
    if (this.firstMeetingCheck()) {
      level.setVariable("guestRoomIsFree", 1);
      return "meeting";
    }
  }

  aboutInsect() {
    const text = this.dialog.t("about-insect");
    if (game.player.statistics.perception > 5)
      return this.dialog.t("about-insect-perception") + "<br><br>" + text;
    return text;
  }

  aboutInsectPress2() {
    switch (this.dialog.previousAnswer) {
    case "insect-press-speech":
      return this.dialog.t("about-insect-press#2");
    case "insect-press-spellcast":
      return this.dialog.t("about-insect-press#2-magic");
    }
  }

  prompt() {
    switch (this.dialog.previousAnswer) {
    case "ask-about-insects":
      return this.aboutInsect();
    case "answer-seeing-around":
    case "ask-about-place":
      return this.dialog.t("about-town");
    case "ask-about-npc":
      return this.dialog.t("about-self");
    case "ask-for-job":
      return this.dialog.t("about-jobs");
    case "ask-about-speech":
      return this.dialog.t("about-speech");
    }
  }

  get changelingQuest() {
    return game.quests.getQuest("changelingQuest");
  }

  knowsAboutInsectPony() {
    return this.changelingQuest && !this.changelingQuest.hidden && !this.changelingQuest.isObjectiveCompleted("findLair");
  }

  canAskAboutInsectPony() {
    return this.dialog.previousAnswer != "ask-about-insects" && this.knowsAboutInsectPony();
  }

  canPressAboutInsectPony() {
    const stats = game.player.statistics;
    return this.dialog.previousAnswer == "ask-about-insects" &&
      (stats.intelligence >= 8 || stats.outdoorsman > 58);
  }

  canPressUsingMagic() {
    return game.player.statistics.spellcasting > 60;
  }

  canPressUsingSpeech() {
    return game.player.statistics.speech > 70;
  }
}
