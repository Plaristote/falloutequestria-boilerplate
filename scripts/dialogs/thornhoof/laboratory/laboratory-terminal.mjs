import {skillCheck} from "../../../cmap/helpers/checks.mjs";
import {requireQuest, QuestFlags} from "../../../quests/helpers.mjs";

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

  canLookUpSentinel() {
    const quest = this.sentinelQuest;
    return quest && quest.hasVariable("knowsAboutSentinel") && quest.hasVariable("knowsAboutLaboratory");
  }

  canStumbleUponSentinel() {
    return this.sentinelQuest && this.sentinelQuest.hasVariable("knowsAboutSentinel") && !this.npc.hasVariable("foundAboutSentinel");
  }

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
