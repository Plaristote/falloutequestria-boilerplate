import {DialogHelper} from "../helpers.mjs";
import {requireQuest} from "../../quests/helpers.mjs";

class Dialog extends DialogHelper {
  constructor(model) {
    super(model);
    this.changelingQuest = game.quests.getQuest("changelingQuest");
  }

  getEntryPoint() {
    if (this.firstMeetingCheck())
      return this.dialog.npc.script.dialogShouldStartAsHostile ? "meeting-as-enemy" : "meeting";
    if (this.reportPetioleQuestState() === "petiole-quest/report-failure")
      return "petiole-quest/report-failure";
  }

  nextMissionState() {
    switch (this.dialog.npc.getVariable("questsGiven", 0)) {
    case 0:
      return "petiole-quest/give";
    }
    return "no-more-quests";
  }

  canAskAboutMission() {
    return this.nextMissionState() != "no-more-quests" && this.nextReportState() == "no-more-report";
  }

  nextReportState() {
    let result;
    switch (this.dialog.npc.getVariable("questsGiven", 0)) {
    case 1:
      result = this.reportPetioleQuestState();
      break ;
    }
    return result ? result : "no-more-report";
  }

  canReportAboutMission() {
    return this.nextReportState() != "no-more-report";
  }

  canExitDialogue() {
    return this.dialog.npc.hasVariable("questsGiven") && this.exitBlocked !== true;
  }

  canDenounceCaput() {
    return this.changelingQuest.hasVariable("hiveShownByCaput") && !this.changelingQuest.hasVariable("caputDenounced");
  }

  canAskWhyHelp() {
    return this.dialog.previousAnswer !== "answer-ask-why-help";
  }

  canAskAboutMayor() {
    return this.dialog.previousAnswer !== "ask-about-mayor" && game.hasVariable("metUnhausMayor");
  }

  canTellBloodyMessAboutReproduction() {
    return this.dialog.previousAnswer === "ask-about-reproduction" && game.player.statistics.traits.indexOf("bloody-mess") >= 0;
  }

  canQuestionPurpose() {
    return this.dialog.previousAnswer === "about-help-purpose-ask-followup" && (game.player.statistics.intelligence > 6 || game.player.statistics.speech >= 100);
  }

  canTellAboutChangelingKills() {
    return this.dialog.previousAnswer !== "tell-about-changeling-kills" && game.player.statistics.getKilledRaces().indexOf("changeling") >= 0;
  }

  canAskAboutMines() {
    return this.dialog.previousAnswer !== "ask-about-slavery" && false; // TODO
  }

  meeting() {
    switch (this.dialog.previousAnswer) {
    default:
      if (level.hasVariable("guardSentPlayerToQueen"))
        return { textKey: "meeting-guard" };
      game.dataEngine.addReputation("changeling-hive", 25);
      return { textKey: "meeting-sneak" };
    case "denounce-caput":
      this.changelingQuest.setVariable("caputDenounced", 1);
      return { textKey: "caput-denounced" };
    case "answer-ask-why-help":
      return { textKey: "meeting-money" };
    }
  }

  meetingAsEnemy() {
    switch (this.dialog.previousAnswer) {
      case "meeting-as-enemy-question":
        return { textKey: "on-meeting-as-enemy-question" };
      default:
        game.dataEngine.addReputation("changeling-hive", -25);
        break ;
    }
  }

  prompt() {
    switch (this.dialog.previousAnswer) {
    case "answer-meeting-listen":
      return { textKey: "on-meeting-listen" };
    case "ask-about-mayor":
      return { textKey: "about-mayor" };
    case "tell-about-changeling-kills":
      return { textKey: "about-changeling-kills" };
    case "ask-about-slavery":
      return { textKey: "about-slavery" };
    case "meeting-as-enemy-surrender":
      return { textKey: "on-meeting-surrender" };
    case "meeting-as-enemy-argue":
      return { textKey: "on-meeting-as-enemy-argue" };
    }
  }

  aboutChangelings() {
    switch (this.dialog.previousAnswer) {
    case "ask-about-diet":
      return { textKey: "about-diet" };
    case "ask-about-reproduction":
      return { textKey: "about-reproduction" };
    case "about-changelings-tell-bloody-mess":
      return { textKey: "on-bloody-mess" };
    }
  }

  aboutHelpPurpose() {
    switch (this.dialog.previousAnswer) {
    case "about-help-purpose-ask-followup":
      return { textKey: "about-help-purpose-followup" };
    case "about-help-question-purpose":
      game.dataEngine.addReputation("changeling-hive", 50);
      return { textKey: "about-help-questionned-purpose" };
    }
  }

  givePetioleQuest() {
    let quest;

    if (!game.quests.hasQuest("cristal-den/pimp-changeling")) {
      quest = game.quests.addQuest("cristal-den/pimp-changeling");
      quest.script.startedByChangelingQueen = true;
    } else {
      quest = game.quests.getQuest("cristal-den/pimp-changeling");
    }
    this.exitBlocked = true;
  }

  acceptPetioleQuest() {
    let text = this.dialog.tr("petiole-quest/accepted");

    this.dialog.npc.setVariable("questsGiven", 1);
    this.exitBlocked = false;
    if (this.changelingQuest.hasVariable("kidnapped"))
      text += "<br>" + this.dialog.tr("kidnapped-equipment-location");
    this.changelingQuest.setVariable("queenProposal", 1);
    this.changelingQuest.completed = true;
    return text;
  }

  reportPetioleQuestState() {
    const quest = game.quests.getQuest("cristal-den/pimp-changeling");

    if (quest) {
      if (quest.failed || quest.script.petioleKilled)
        return "petiole-quest/report-failure";
      return quest.completed ? "petiole-quest/report-success" : null;
    }
    return null;
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
