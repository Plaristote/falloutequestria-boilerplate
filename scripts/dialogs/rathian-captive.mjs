import {DealWithRathian} from "../characters/rathian/captive.mjs";

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  get quest() {
    return game.quests.getQuest("stable-103/rathian");
  }

  get cellDoor() {
    return this.dialog.npc.script.cellDoor;
  }

  get isDoorLocked() {
    return this.cellDoor.locked && !this.cellDoor.destroyed;
  }

  getEntryPoint() {
    if (!this.quest.isObjectiveCompleted("trackCulprit")) {
      this.quest.completeObjective("trackCulprit");
      if (!this.dialog.npc.hasVariable("met")) {
        this.dialog.npc.setVariable("met", true);
        return "entry-first-meet";
      }
      return "entry";
    } else if (this.dialog.npc.hasVariable("waitForCellToOpen")) {
      return "decision/help/entry";
    }
    return "question-hub";
  }

  questionHub() {
    switch (this.dialog.previousAnswer) {
    case "tell-quest-lie":            return { textKey: "on-entry-lie", mood: "dubious" };
    case "tell-quest-evasive":        return { textKey: "on-entry-evasive", mood: "angry" };
    case "learn-quest-ask-questions": return { textKey: "question-hub-from-learn-quest", mood: "smile" };
    }
    return { textKey: "question-hub" };
  }

  captureStory() {
    this.quest.setVariable("knowsAboutLaboratory", 1);
  }

  knowsAboutSentinel() {
    return this.quest.hasVariable("knowsAboutSentinel");
  }

  knowsAboutLaboratory() {
    return this.quest.hasVariable("knowsAboutLaboratory");
  }

  knowsAboutArcanicRituals() {
    return game.player.statistics.spellcasting > 90;
  }

  knowsAboutArcanicScience() {
    return game.player.statistics.science > 89;
  }

  canUseSarcasm() {
    return game.player.statistics.speech > 73;
  }

  canAskAboutStableLocation() {
    return this.dialog.npc.hasVariable("knowsPlayerTracked");
  }

  canTellAboutQuest() {
    return !this.dialog.npc.hasVariable("knowsPlayerTracked");
  }

  askAboutStableKnowldege() {
    if (this.dialog.npc.hasVariable("playerLedToStable"))
      return "stable-location/led-to-stable";
    if (!game.getVariable("rathian-knows-stable-location", false))
      return "stable-location/prior-knowledge";
    return "stable-location/told-before";
  }

  askAboutStableInterest() {
    return "stable-location/stable-interest-sentinel"
      + (this.quest.hasVariable("knowsAboutSentinel") ? "-known" : "-unknown");
  }

  askAboutLaboratory() {
    if (this.quest.hasVariable("knowsAboutSentinel")) {
      return "laboratory/intro";
    } else if (this.dialog.npc.hasVariable("knowsPlayerTracked")) {
      return "laboratory/sentinel-required";
    }
    return "laboratory/evasive";
  }

  canCallLaboratoryLie() {
    return game.player.statistics.intelligence > 4 || game.player.statistics.speech >= 65;
  }

  sentinelIntro() {
    this.quest.setVariable("knowsAboutSentinel", 1);
  }

  laboratoryIntro() {
    this.quest.setVariable("knowsAboutLaboratory", 2);
  }

  laboratoryLearnQuest() {
    this.learnQuest();
  }

  learnQuest() {
    this.dialog.npc.setVariable("knowsPlayerTracked", 1);
  }

  decisionHelp() {
    this.dialog.npc.setVariable("waitForCellToOpen", 1);
  }

  letsGoAlready() {
    console.log("LETS GO ALREADY");
    this.dialog.npc.script.onInvitedToEscape();
    this.dialog.npc.unsetVariable("waitForCellToOpen");
  }

  startFight() {
    game.player.setAsEnemy(this.dialog.npc);
    this.dialog.npc.setAsEnemy(game.player);
  }

  dealWithRathianIfFreed() {
    return this.quest.hasVariable("rathianConvinced")
      ? "decision/deal-with-rathian/if-convinced"
      : "decision/deal-with-rathian/if-freed";
  }

  alternativeConvinced() {
    this.dialog.npc.script.toggleDealWithRathianFlag(DealWithRathian.GaveUpSentinel);
  }

  leaveRathianBehind() {
    this.dialog.npc.script.toggleDealWithRathianFlag(DealWithRathian.LeaveBehind);
  }

  helpRathianLeave() {
    this.dialog.npc.script.onInvitedToEscape();
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
