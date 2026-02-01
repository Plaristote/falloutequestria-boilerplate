import {skillCheck} from "../../cmap/helpers/checks.mjs";
import {QuestFlags, requireQuest} from "../../quests/helpers.mjs";
import {DialogHelper} from "../helpers.mjs";

class Dialog extends DialogHelper {
  constructor(dialog) {
    super(dialog);
  }

  getEntryPoint() {
    if (this.firstMeetingCheck())
      return "intro";
  }

  get playerUsedName() {
    if (this.playerToldSteelRanger)
      return this.dialog.t("player-name-ranger", { name: game.player.statistics.name });
    else if (this.playerToldName)
      return game.player.statistics.name;
    return this.dialog.t("player-name-unknown");
  }

  set playerToldName(value) {
    this.dialog.npc.setVariable("knowsPlayerName", value ? 1 : 0);
  }

  get playerToldName() {
    return this.dialog.npc.getVariable("knowsPlayerName", 0) == 1;
  }

  set playerToldSteelRanger(value) {
    this.dialog.npc.setVariable("knowsPlayerRanger", value ? 1 : 0);
  }

  get playerToldSteelRanger() {
    return this.dialog.npc.getVariable("knowsPlayerRanger") == 1;
  }

  set toldAboutLabQuest(value) {
    this.dialog.npc.setVariable("toldLabQuest", value ? 1 : 0);
  }

  get toldAboutLabQuest() {
    return this.dialog.npc.getVariable("toldLabQuest") == 1;
  }

  prompt() {
    switch (this.dialog.previousAnswer) {
    case "intro-as-steel-ranger":
      this.playerToldName = true;
      return { textKey: "intro-steel-ranger-disbelief", mood: "angry" };
    case "intro-present-self":
      this.playerToldName = true;
      return { textKey: "intro-react", mood: "smile" };
    case "ask-about-steel-rangers":
      return { textKey: "about-steel-rangers", mood: "neutral" };
    }
  }

  canIntroAsSteelRanger() {
    const joinQuest = game.quests.getQuest("steel-rangers/join");
    return joinQuest && joinQuest.completed;
  }

  tryIntroAsSteelRanger() {
    if (skillCheck(game.player, "speech", { target: 120 })) {
      this.playerToldSteelRanger = true;
      return "steel-ranger-aknowledged";
    }
    return "prompt";
  }

  askAboutMission() {
    if (this.labQuest.inProgress)
      return "lab-quest/prompt";
    else if (this.labQuest.completed && !this.labQuest.failed)
      return "war-liaison/prompt";
    return "waiting-to-leave";
  }

  requireLabQuest() {
    return requireQuest("steel-rangers/hoarfrostQuest", QuestFlags.HiddenQuest);
  }

  get labQuest() {
    return this.requireLabQuest();
  }

  labQuestPrompt() {
    this.toldAboutLabQuest = true;
    this.requireLabQuest();
    switch (this.dialog.previousAnswer) {
    case "ask-about-mission":
      return { textKey: "lab-quest/about-diplomatic-mission" };
    case "ask-call-for-action":
      return { textKey: "lab-quest/call-for-action" };
    case "lab-quest-offer-help":
      this.labQuest.hidden = false;
      return { textKey: "lab-quest/offered-help" };
    case "ask-about-thornhoof-not-cooperating":
      return { textKey: "lab-quest/about-council-intents" };
    case "ask-about-rangers-intent":
      return { textKey: "lab-quest/about-rangers-motives" };
    }
  }

  labQuestCanAskAboutRangersIntent() {
    return this.dialog.previousAnswer == "ask-about-thornhoof-not-cooperating";
  }

  canReportLabQuest() {
    return this.toldAboutLabQuest
        && this.labQuest.inProgress
        && this.labQuest.isObjectiveCompleted("battery")
        && !this.labQuest.isObjectiveCompleted("report");
  }

  labQuestReport() {
    this.labQuest.hidden = false;
    this.labQuest.completeObjective("report");
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
