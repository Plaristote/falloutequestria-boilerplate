import {DialogHelper} from "../helpers.mjs";
import {requireQuest} from "../../quests/helpers.mjs";

class Dialog extends DialogHelper {
  getEntryPoint() {
    if (this.dialog.npc.hasVariable("exploringHive"))
      return "hive-ally/prompt";
    if (this.firstMeetingCheck())
      return "greeting";
  }

  get investigateQuest() {
    return game.quests.getQuest("unhaus/investigateUnhaus");
  }

  get hasAcceptedToHelp() {
    return this.investigateQuest != null && this.investigateQuest.script.events.indexOf("backtrack-gave-quest") >= 0;
  }

  get hasFoundHive() {
    return this.investigateQuest != null && this.investigateQuest.completed;
  }

  get hasActiveTrapQuest() {
    const quest = game.quests.getQuest("unhaus/searching-father");

    return quest != null && !quest.completed && !quest.failed;
  }

  get queenIsDead() {
    const queen = game.getCharacter("unhaus/queen");

    return queen == null || !queen.isAlive();
  }

  get hasAvengedDaughter() {
    return this.queenIsDead && this.dialog.npc.hasVariable("foundDaughter");
  }

  get hiveAllyIntroKey() {
    if (this.hasAvengedDaughter)
      return "hive-ally/prompt-avenged";
    if (this.dialog.npc.hasVariable("foundDaughter"))
      return "hive-ally/prompt-daughter-found";
    return "hive-ally/prompt";
  }

  canAskIfRanAway() {
    return this.dialog.previousAnswer !== "ask-if-ran-away";
  }

  canTellAboutInvestigation() {
    return game.quests.hasQuest("unhaus/investigateUnhaus") && this.dialog.previousAnswer !== "tell-about-investigation";
  }

  canOfferHelpBacktrack() {
    return !this.hasAcceptedToHelp;
  }

  canAttemptLeadToTrap() {
    const quest = game.quests.getQuest("unhaus/searching-father");

    if (!this.hasAcceptedToHelp)
      return false;
    if (this.dialog.npc.hasVariable("leadingToTrap"))
      return false;
    if (quest && (quest.completed || quest.failed))
      return false;
    return this.hasFoundHive || this.hasActiveTrapQuest;
  }

  canLeadToTrap() {
    return this.hasActiveTrapQuest;
  }

  canJoinBacktrackFight() {
    return !this.hasAvengedDaughter;
  }

  canRevealHive() {
    return this.hasFoundHive;
  }

  prompt() {
    switch (this.dialog.previousAnswer) {
    case "ask-about-poneva":
      return { textKey: "about-poneva", mood: "neutral" };
    case "ask-if-ran-away":
      return { textKey: "on-ran-away-question", mood: "angry" };
    case "ask-about-suspicious":
      return { textKey: "about-suspicious-activity", mood: "dubious" };
    case "tell-about-investigation":
      return { textKey: "on-told-about-investigation", mood: "cocky" };
    case "help-backtrack/decline":
      return { textKey: "on-decline-help", mood: "sad" };
    case "reveal-clue/nevermind":
      return { textKey: "on-reveal-clue-nevermind", mood: "neutral" };
    default:
      if (this.dialog.npc.hasVariable("leadingToTrap"))
        return { textKey: "prompt-following" };
    }
  }

  acceptHelpBacktrack() {
    const quest = requireQuest("unhaus/investigateUnhaus");

    quest.script.onBacktrackGaveQuest();
    quest.hidden = false;
    return this.dialog.tr("help-backtrack/accepted");
  }

  attemptLeadToTrap() {
    if (game.player.statistics.speech <= 80)
      return ;

    this.startHiveEscort();
    return { textKey: "lead-to-trap-success" };
  }

  revealHiveToBacktrack() {
    this.startHiveEscort();
  }

  startHiveEscort() {
    this.dialog.npc.setVariable("leadingToTrap", 1);
    this.dialog.npc.tasks.addUniqueTask("followingPlayerToHive", 500, 1);
  }

  // BEGIN Hive assault dialog
  hiveAllyPrompt() {
    const daughterFound = this.dialog.npc.hasVariable("foundDaughter");
    switch (this.dialog.previousAnswer) {
    case "hive-ally/agree":
      return { textKey: "on-hive-ally-agree" };
    case "hive-ally/caution":
      return { textKey: (daughterFound ? "on-hive-ally-caution-alt" : "on-hive-ally-caution") };
    default:
      return { textKey: this.hiveAllyIntroKey };
    }
  }

  leaveBacktrackDialogue() {
    if (this.hasAvengedDaughter) {
      const actions = this.dialog.npc.actionQueue;
      this.dialog.npc.tasks.removeTask("followPlayer");
      actions.pushMoveToZone("pony-storage");
      actions.start();
    }
  }
  // END Hive assault dialog
}

export function create(dialog) {
  return new Dialog(dialog);
}
