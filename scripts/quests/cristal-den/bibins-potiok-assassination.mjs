import {QuestHelper, QuestFlags, requireQuest} from "../helpers.mjs";
import * as Potioks from "./potioks.mjs";
import {isTroutHeir, isTroutDead} from "./heir-selection.mjs";

// Bibin does not care about Trout Potiok... until the Matriarch names him her heir: then he
// becomes a target like any other. (Only the player and the changelings know that "Trout"
// is Petiole, so killing Petiole is what kills Trout.)
export function troutIsTarget() {
  return isTroutHeir();
}

export function allPotiokTargetsDead() {
  return Potioks.matriarchDead() && Potioks.allHeirsDead()
      && (!troutIsTarget() || isTroutDead());
}

export default class extends QuestHelper {
  constructor(model) {
    super(model);
    this.xpReward = 1500;
  }

  initialize() {
    this.model.location = "cristal-den";
  }

  getDescription() {
    let text = `<p>${this.tr("description")}</p>`;

    if (troutIsTarget())
      text += `<p>${this.tr(isTroutDead() ? "desc-trout-dead" : "desc-trout-heir")}</p>`;
    return text;
  }

  getObjectives() {
    const objectives = [];

    objectives.push({
      label: this.tr("kill-matriarch"),
      success: Potioks.matriarchDead()
    });
    objectives.push({
      label: this.tr("kill-rewan"),
      success: Potioks.rewanDead()
    });
    objectives.push({
      label: this.tr("kill-bitty"),
      success: Potioks.bittyDead()
    });
    objectives.push({
      label: this.tr("kill-crafty"),
      success: Potioks.craftyDead()
    });
    if (troutIsTarget() && !this.model.completed) {
      objectives.push({
        label: this.tr("kill-trout"),
        success: isTroutDead()
      });
    }
    if (allPotiokTargetsDead()) {
      objectives.push({
        label: this.tr("report"),
        success: this.model.isObjectiveCompleted("report"),
        failure: game.getCharacter("cristal-den/bibin") && !game.getCharacter("cristal-den/bibin").isAlive()
      });
    }
    return objectives;
  }

  get canReport() {
    return allPotiokTargetsDead() && !this.model.completed;
  }
}
