import {DialogHelper} from "../helpers.mjs";

class Dialog extends DialogHelper {
  constructor(dialog) {
    super(dialog);
  }

  getEntryPoint() {
    if (level.name === "unhaus-hive")
      return this.metInHive ? "hive-prompt" : "hive-meeting";
    else {
      if (this.firstMeetingCheck())
        return "meeting";
      return "prompt";
    }
  }

  prompt() {
    switch (this.dialog.previousAnswer) {
    case "meeting-ans-insect":
      return { text: "?", mood: "dubious" };
    case "meeting-ans-insulting":
      return { textKey: "after-insult", mood: "sad" };
    case "meeting-ans-curiosity":
      return { textKey: "about-self" };
    case "ask-about-npc":
      return { textKey: "about-self-extended" };
    case "ask-about-closet":
      return { textKey: "about-closet" };
    }
  }

  aboutRace() {
    switch (this.dialog.previousAnswer) {
    case "about-race-ans-hive":
      return { textKey: "about-race-hive" };
    case "about-race-ans-friends":
      return { textKey: "about-race-friends" };
    }
  }

  hiveMeeting() {
    this.metInHive = true;
  }

  hivePrompt() {
    switch (this.dialog.previousAnswer) {
      case "hive-meeting-ans-bad":
      case "hive-meeting-ans-horrible":
      case "hive-meeting-ans-danger":
      case "hive-meeting-ans-dead":
      case "hive-meeting-ans-sad":
        return { textKey: "hive-prompt-outside-bad" };
      case "hive-meeting-ans-alright":
        return { textKey: "hive-prompt-outside-good" };
      case "ask-about-queen":
        return { textKey: "about-queen" };
    }
  }

  get metInHive() {
    return this.dialog.npc.getVariable("metInHive", 0) == 1;
  }

  set metInHive(value) {
    return this.dialog.npc.setVariable("metInHive", value ? 1 : 0);
  }

  get changelingQuest() {
    return game.quests.getQuest("changelingQuest");
  }

  get knowsAboutInsectPony() {
    return this.changelingQuest && this.changelingQuest.isObjectiveCompleted("findAboutUnhaus");
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
