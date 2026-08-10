import {QuestHelper, QuestFlags, requireQuest} from "../helpers.mjs";
import * as Potioks from "./potioks.mjs";

export default class extends QuestHelper {
  constructor(model) {
    super(model);
    this.xpReward = 1500;
  }

  initialize() {
    this.model.location = "cristal-den";
  }

  getObjectives() {
    const objectives = [];

    objectives.push({
      label: this.tr("kill-matriarch"),
      success: Potioks.matriarchDead()
    });
    objectives.push({
      label: this.tr("kill-pat"),
      success: Potioks.patDead()
    });
    objectives.push({
      label: this.tr("kill-bitty"),
      success: Potioks.bittyDead()
    });
    objectives.push({
      label: this.tr("kill-crafty"),
      success: Potioks.craftyDead()
    });
    if (Potioks.matriarchDead() && Potioks.allHeirsDead()) {
      objectives.push({
        label: this.tr("report"),
        success: this.model.isObjectiveCompleted("report"),
        failure: game.getCharacter("cristal-den/bibin") && !game.getCharacter("cristal-den/bibin").isAlive()
      });
    }
    return objectives;
  }

  get canReport() {
    return Potioks.matriarchDead() && Potioks.allHeirsDead() && !this.model.completed;
  }
}
