import {skillCheck} from "../../../cmap/helpers/checks.mjs";
import {requireQuest, QuestFlags} from "../../../quests/helpers.mjs";
import {SentinelOutcome} from "../../../characters/rathian/flags.mjs";

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  get sentinelQuest() {
    return requireQuest("stable-103/rathian", QuestFlags.HiddenQuest);
  }

  get labQuest() {
    return requireQuest("thornhoof/scrollQuest", QuestFlags.HiddenQuest);
  }

  get labQuestScrollConfessed() {
    return this.labQuest.getVariable("confessedInIntro", 0) == 1;
  }

  get sentinelTerminal() {
    return this.dialog.npc;
  }

  // BEGIN SENTINEL
  canLookUpSentinel() {
    const quest = this.sentinelQuest;
    return quest && quest.hasVariable("knowsAboutSentinel") && quest.hasVariable("knowsAboutLaboratory")
                 && !quest.hasVariable("sentinelOutcome") && !this.dialog.npc.script.sentinelResolved;
  }

  canStumbleUponSentinel() {
    return this.sentinelQuest && this.sentinelQuest.hasVariable("knowsAboutSentinel") && !this.dialog.npc.hasVariable("foundAboutSentinel");
  }

  rathianAccompanying() {
    return game.playerParty.contains(game.getCharacter("rathian"));
  }

  rathianConvinced() {
    return this.sentinelQuest.hasVariable("rathianConvinced");
  }

  rathianOpposes(action) {
    if (!this.rathianAccompanying()) return false;
    if (this.rathianConvinced()) return action === "imprint-player";
    return true;
  }

  attemptSelfImprint() {
    if (this.rathianOpposes("imprint-player")) {
      this.sentinelQuest.setVariable("sentinelOutcome", SentinelOutcome.AppliedToPlayer);
      return "sentinel-lookup/rathian-intervenes";
    }

    const success = skillCheck(game.player, "science", { target: 130 })
      || skillCheck(game.player, "spellcasting", { target: 130 })
      || skillCheck(game.player, "luck", { target: 160 });

    if (!success)
      return "sentinel-lookup/imprint-failure";

    this.sentinelTerminal.script.sentinelResolved = true;
    this.sentinelQuest.setVariable("sentinelOutcome", SentinelOutcome.AppliedToPlayer);
    if (this.rathianAccompanying())
      this.sentinelQuest.setVariable("rathianConsented", 1);
    this.sentinelQuest.completeObjective("dealWithRathian");
    return "sentinel-lookup/imprint-success";
  }

  attemptDestroySentinel() {
    if (this.rathianOpposes("destroy")) {
      this.sentinelQuest.setVariable("sentinelOutcome", SentinelOutcome.Destroyed);
      return "sentinel-lookup/rathian-intervenes";
    }

    this.sentinelTerminal.script.sentinelResolved = true;
    this.sentinelQuest.setVariable("sentinelOutcome", SentinelOutcome.Destroyed);
    if (this.rathianAccompanying())
      this.sentinelQuest.setVariable("rathianConsented", 1);
    this.sentinelQuest.completeObjective("dealWithRathian");
    return "sentinel-lookup/destroyed";
  }

  // BEGIN SCROLL LOGS
  foundScrollLogs() {
    return this.labQuest.hasVariable("foundScrollLogs");
  }

  canFindScrollLogs() {
    return !this.foundScrollLogs() && !this.labQuest.isObjectiveCompleted("holodisk");
  }

  canOpenScrollLogs() {
    return this.foundScrollLogs() && !this.labQuest.isObjectiveCompleted("holodisk");
  }

  searchComputer() {
    const time = 10 + Math.ceil(Math.random() * 90);

    game.asyncAdvanceTime(time);
    if (this.canStumbleUponSentinel()) {
      const success = skillCheck(game.player, "science", { target: 110 });
      if (success)
        return "sentinel-lookup/searched";
    } else if (!this.canFindScrollLogs()) {
      const success = skillCheck(game.player, "science", {
        target: 160,
        bonus: this.labQuestScrollConfessed ? 50 : 0
      });
      if (success) {
        this.labQuest.setVariable("foundScrollLogs", 1);
        return "scroll-logs/searched";
      }
    } else {
      return "search-over";
    }
    return "search-failure";
  }

  get scrollHolodisk() {
    return game.player.inventory.getItemOfType("thornhoof-lab-quest-holodisk");
  }

  canUseScrollHolodisk() {
    return this.scrollHolodisk != null && !this.labQuest.isObjectiveCompleted("holodisk");
  }

  useScrollHolodisk() {
    this.labQuest.completeObjective("holodisk");
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
