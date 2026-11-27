import {QuestHelper} from "../helpers.mjs";
import {matriarchDead} from "./potioks.mjs";
import {TROUT} from "./heir-selection.mjs";
import {troutReplacedByChangeling} from "./pimp-changeling.mjs";

const questName = "cristal-den/potiok-chaos";

// The Changeling Queen wants the Potiok dynasty to fall into chaos. Two ways to get there:
//  - bloody: the Matriarch dies (checkEnding). The heirs are left to fight over the seat,
//    which is the chaos the Queen wants: they do not need to die for the quest to be done;
//  - quiet ("Trout plan"): Petiole, wearing Trout Potiok's face, is named heir by the
//    Matriarch herself (onHeirChosen). The player may propose this plan to the Queen,
//    or improvise it by suggesting Trout to the Matriarch (see suggestHeir()).
export function potiokChaosQuest() {
  return game.quests.getQuest(questName);
}

export function isTroutPlanActive() {
  const quest = potiokChaosQuest();

  return !!quest && quest.script.troutPlan && !quest.completed && !quest.failed;
}

export default class PotiokChaos extends QuestHelper {
  get xpReward() {
    return this.troutIsHeir ? 3000 : 2250;
  }

  initialize() {
    this.model.location = "cristal-den";
    // Both ways are presented from the start: kill the Matriarch (and let the heirs // TODO this is not right, we should have two separate objectives
    // fight over the seat), or - once Petiole wears Trout's face - have her name Trout.
    this.model.addObjective("sowChaos", this.tr(troutReplacedByChangeling() ? "sowChaosEither" : "sowChaos"));
  }

  getDescription() {
    let text = `<p>${this.tr("description")}</p>`;

    if (this.troutPlan)
      text += `<p>${this.tr("desc-trout-plan")}</p>`;
    else if (troutReplacedByChangeling() && !this.model.completed && !this.model.failed)
      text += `<p>${this.tr("desc-options")}</p>`;
    if (this.model.completed && !this.model.failed)
      text += `<p>${this.tr(this.troutIsHeir ? "desc-completed-heir" : "desc-completed-chaos")}</p>`;
    else if (this.model.failed)
      text += `<p>${this.tr("desc-failed")}</p>`;
    return text;
  }

  get troutPlan() {
    return this.model.hasVariable("troutPlan");
  }

  get troutIsHeir() {
    return this.model.hasVariable("troutIsHeir");
  }

  // The Queen agreed (or the player improvised): the objective changes from
  // "sow chaos" to "get Trout named heir".
  proposeTroutPlan() {
    if (this.troutPlan || this.model.completed || this.model.failed)
      return ;
    this.model.setVariable("troutPlan", 1);
    // Same objective, new wording (addObjective overwrites an existing label).
    this.model.addObjective("sowChaos", this.tr("installTrout"));
  }

  // Called by finalizeHeir() once the Matriarch has made her final choice.
  onHeirChosen(heirId) {
    if (this.model.completed || this.model.failed)
      return ;
    if (heirId === TROUT) {
      this.model.setVariable("troutIsHeir", 1);
      this.proposeTroutPlan();
      this.model.completeObjective("sowChaos");
      this.model.completed = true;
    } else if (this.troutPlan) {
      this.model.failObjective("sowChaos");
      this.model.failed = true;
    }
  }

  // Called after each Potiok death (see notifyPotiokDeath()).
  checkEnding() {
    if (this.model.completed || this.model.failed || !matriarchDead())
      return ;
    if (this.troutPlan) {
      // No Matriarch left to name Trout.
      this.model.failObjective("sowChaos");
      this.model.failed = true;
    } else {
      this.model.completeObjective("sowChaos");
      this.model.completed = true;
    }
  }
}
