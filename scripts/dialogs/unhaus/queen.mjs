import DialogHelper from "../helpers.mjs";
import {requireQuest, QuestFlags} from "../../quests/helpers.mjs";
import {skillContest} from "../../cmap/helpers/checks.mjs";
import {troutReplacedByChangeling} from "../../quests/cristal-den/pimp-changeling.mjs";

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
    if (this.reportSearchingFatherState() === "searching-father/report-failure")
      return "searching-father/report-failure";
    if (this.reportPotiokQuestState() === "potiok-quest/report-failure")
      return "potiok-quest/report-failure";
  }

  // Quest chain, in the order the Queen offers them. Reordering is just
  // reordering this array - no numeric stages to keep in sync.
  //
  // Each quest can be resolved out of band (Backtrack killed/led to the
  // trap via his own dialog, Petiole's pimp dealt with some other way)
  // before the Queen has ever formally given it, or while an earlier quest
  // in the list is still open. nextMissionState()/nextReportState() walk
  // the list in order and stop at the first quest that isn't fully
  // acknowledged yet - so an already-resolved later quest just waits its
  // turn rather than jumping the queue, and the Queen still always leads
  // with whichever quest is first in this array.
  //
  // cristal-den/potiok-chaos comes last because it leans on Petiole
  // already having Trout Potiok's face - see givePetioleQuest() below.
  get questChain() {
    return [
      { id: "unhaus/searching-father", giveState: "searching-father/give", reportStateFn: this.reportSearchingFatherState.bind(this) },
      { id: "cristal-den/pimp-changeling", giveState: "petiole-quest/give", reportStateFn: this.reportPetioleQuestState.bind(this) },
      { id: "cristal-den/potiok-chaos", giveState: "potiok-quest/give", reportStateFn: this.reportPotiokQuestState.bind(this) }
    ];
  }

  acknowledgedKey(questId) {
    return "acknowledged-" + questId.replace(/\//g, "-");
  }

  isAcknowledged(questId) {
    return this.dialog.npc.hasVariable(this.acknowledgedKey(questId));
  }

  acknowledge(questId) {
    this.dialog.npc.setVariable(this.acknowledgedKey(questId), 1);
  }

  // Quest objects get created the moment a quest is *offered* (see
  // givePetioleQuest()/giveSearchingFatherQuest()), not once it's accepted -
  // so game.quests.hasQuest() alone can't tell "offered" from "accepted".
  // This flag is only set in acceptQueenQuest(), once the player actually
  // says yes.
  acceptedKey(questId) {
    return "accepted-" + questId.replace(/\//g, "-");
  }

  isAccepted(questId) {
    return this.dialog.npc.hasVariable(this.acceptedKey(questId));
  }

  markAccepted(questId) {
    this.dialog.npc.setVariable(this.acceptedKey(questId), 1);
  }

  get hasEngagedWithQueen() {
    return this.questChain.some(entry => this.isAccepted(entry.id) || this.isAcknowledged(entry.id));
  }

  askAboutMissionText() {
    if (this.isAccepted(this.questChain[0].id))
      return this.dialog.tr("ask-about-mission-alt");
    return this.dialog.tr("ask-about-mission");
  }

  nextMissionState() {
    for (const entry of this.questChain) {
      if (this.isAcknowledged(entry.id))
        continue ;
      if (entry.reportStateFn())
        return "no-more-quests"; // resolved, waiting on a report first
      if (this.isAccepted(entry.id))
        return "no-more-quests"; // accepted, still active
      return entry.giveState;
    }
    return "no-more-quests";
  }

  canAskAboutMission() {
    return this.nextMissionState() != "no-more-quests" && this.nextReportState() == "no-more-report";
  }

  nextReportState() {
    for (const entry of this.questChain) {
      if (this.isAcknowledged(entry.id))
        continue ;
      const reportState = entry.reportStateFn();
      return reportState ? reportState : "no-more-report";
    }
    return "no-more-report";
  }

  canReportAboutMission() {
    return this.nextReportState() != "no-more-report";
  }

  canExitDialogue() {
    return this.hasEngagedWithQueen && this.exitBlocked !== true;
  }

  canDenounceCaput() {
    return this.changelingQuest.hasVariable("hiveShownByCaput") && !this.changelingQuest.hasVariable("caputDenounced");
  }

  canAskWhyHelp() {
    return this.dialog.previousAnswer !== "answer-ask-why-help";
  }

  canRejectMoney() {
    return this.dialog.previousAnswer === "answer-ask-why-help";
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
    return this.dialog.previousAnswer !== "ask-about-mines" && false; // TODO
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
      return { textKey: "caput-denounce" };
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
    case "ask-about-mines":
      return { textKey: "about-slavery" };
    case "ideal-surrender":
    case "meeting-as-enemy-surrender":
      return { textKey: "on-meeting-surrender" };
    case "meeting-as-enemy-argue":
      return { textKey: "on-meeting-as-enemy-argue" };
    case "potiok-quest/pitch-done":
      return { textKey: "potiok-quest/pitch-back" };
    case "petiole-quest/ask-more-questions":
      // Shared "wait, one more thing" answer used by both quests' give/why
      // states to back out without accepting - undoes the give-hook's
      // exitBlocked=true so the player isn't stranded if they don't accept.
      this.exitBlocked = false;
      break ;
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

  // Fires the "you've thrown in your lot with the hive" main-quest
  // resolution exactly once, on whichever quest the player accepts first -
  // not hard-coded to a specific one, since that's exactly what reordering
  // the chain would otherwise silently break.
  acceptQueenQuest(questId, textKey) {
    let text = this.dialog.tr(textKey);

    this.markAccepted(questId);
    if (!this.changelingQuest.hasVariable("queenProposal")) {
      this.changelingQuest.setVariable("queenProposal", 1);
      this.changelingQuest.completed = true;
      if (this.changelingQuest.hasVariable("kidnapped"))
        text += "<br>" + this.dialog.tr("kidnapped-equipment-location");
    }
    this.exitBlocked = false;
    return text;
  }

  giveSearchingFatherQuest() {
    if (!game.quests.hasQuest("unhaus/searching-father"))
      game.quests.addQuest("unhaus/searching-father");
    this.exitBlocked = true;
  }

  acceptSearchingFatherQuest() {
    return this.acceptQueenQuest("unhaus/searching-father", "searching-father/accepted");
  }

  reportSearchingFatherState() {
    const quest = game.quests.getQuest("unhaus/searching-father");

    if (quest) {
      if (quest.failed)
        return "searching-father/report-failure";
      return quest.completed ? "searching-father/report-success" : null;
    }
    return null;
  }

  onSearchingFatherReportSuccess() {
    const quest = game.quests.getQuest("unhaus/searching-father");

    this.acknowledge("unhaus/searching-father");
    if (quest && quest.script.killedDirectly)
      return { textKey: "searching-father/report-success-murder" };
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
    return this.acceptQueenQuest("cristal-den/pimp-changeling", "petiole-quest/accepted");
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

  onPetioleQuestReportSuccess() {
    this.acknowledge("cristal-den/pimp-changeling");
  }

  givePotiokQuest() {
    // NormalQuest also reveals the quest if the player already improvised it (hidden).
    requireQuest("cristal-den/potiok-chaos", QuestFlags.NormalQuest);
    this.exitBlocked = true;
  }

  acceptPotiokQuest() {
    const text = this.acceptQueenQuest("cristal-den/potiok-chaos", "potiok-quest/accepted");

    if (this.troutPlanApproved)
      game.quests.getQuest("cristal-den/potiok-chaos").script.proposeTroutPlan();
    return text;
  }

  get troutPlanApproved() {
    return this.dialog.npc.hasVariable("trout-plan-approved");
  }

  // The player can pitch the quiet way: Petiole is already wearing Trout
  // Potiok's face, so let the Matriarch name him heir instead of killing the
  // family. Offered while the quest is being given, or afterwards.
  canPitchTrout() {
    const quest = game.quests.getQuest("cristal-den/potiok-chaos");

    return troutReplacedByChangeling()
        && !this.troutPlanApproved
        && !this.dialog.npc.hasVariable("trout-plan-refused")
        && (!quest || (!quest.completed && !quest.failed));
  }

  // In the opening dialogue state, the option only makes sense once the quest is accepted.
  // During the mission briefing, canPitchTrout() alone applies.
  canPitchTroutAfterBriefing() {
    return this.isAccepted("cristal-den/potiok-chaos") && this.canPitchTrout();
  }

  pitchTrout() {
    const later = this.isAccepted("cristal-den/potiok-chaos");
    let approved = skillContest(game.player, this.dialog.npc, "speech") === game.player;

    if (approved) {
      this.dialog.npc.setVariable("trout-plan-approved", 1);
      if (later)
        game.quests.getQuest("cristal-den/potiok-chaos").script.proposeTroutPlan();
      return later ? "potiok-quest/trout-plan-ok-later" : "potiok-quest/trout-plan-ok";
    }
    this.dialog.npc.setVariable("trout-plan-refused", 1);
    return later ? "potiok-quest/trout-plan-refused-later" : "potiok-quest/trout-plan-refused";
  }

  reportPotiokQuestState() {
    const quest = game.quests.getQuest("cristal-den/potiok-chaos");

    if (quest) {
      if (quest.failed)
        return "potiok-quest/report-failure";
      if (!quest.completed)
        return null;
      // Two ways to finish this one: the bloody way (matriarch and heirs
      // dead - see Potioks.chaosSown in the quest script) or the quiet way
      // (Trout Potiok, secretly Petiole, made heir). Same completion flag,
      // different debrief.
      return quest.script.troutIsHeir ? "potiok-quest/report-success-heir" : "potiok-quest/report-success";
    }
    return null;
  }

  onPotiokQuestReportSuccess() {
    this.acknowledge("cristal-den/potiok-chaos");
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
