import {DialogHelper} from "../helpers.mjs";

class Dialog extends DialogHelper {
  constructor(dialog) {
    super(dialog);
  }

  getEntryPoint() {
    if (this.firstMeetingCheck())
      return "meeting";
  }

  prompt() {
    switch (this.dialog.previousAnswer) {
    case "meeting-ans-standoffish":
      return { textKey: "prompt-standoffish", mood: "angry" };
    case "meeting-ans-visiting":
      return { textKey: "prompt-visiting", mood: "dubious" };
    case "meeting-quest-ans-secret":
      return { textKey: "meeting-quest-secrecy", mood: "neutral" };
    case "meeting-quest-ans-insects":
      return { textKey: "meeting-quest-insects", mood: "dubious" };
    case "ask-about-location":
      return { textKey: "about-location", mood: "smile" };
    case "ask-about-npc":
      return { textKey: "about-self", mood: "smile" };
    case "ask-about-town-shape":
      return { textKey: "about-town-shape", mood: "dubious" };
    case "changeling-ans-evasive":
      return { textKey: "about-changeling-on-evasive", mood: "sad" };
    case "changeling-ans-danger":
      return { textKey: "about-changeling-on-danger", mood: "smile" };
    case "changeling-ans-safe":
      return { textKey: "about-changeling-on-safe", mood: "smile" };
    }
  }

  get changelingQuest() {
    return game.quests.getQuest("changelingQuest");
  }

  get knowsAboutInsectPony() {
    return this.changelingQuest && this.changelingQuest.isObjectiveCompleted("findAboutUnhaus");
  }

  get knowsAboutInsectUnderground() {
    return this.changelingQuest && this.changelingQuest.isObjectiveCompleted("findLair");
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
