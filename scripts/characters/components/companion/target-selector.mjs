import {getCompanionStrategy, DEFAULT_COMPANION_STRATEGY} from "./strategies.mjs";
import TargetSelector from "../combat/target-selector.mjs";

function uniqueArray(array) {
  return [...new Set(array)];
}

export default class extends TargetSelector {
  constructor(script) {
    super(script);
    this.commandBonus = 60;
  }

  get commandCompliance() {
    return 0.1 + (this.model.statistics.perception + this.model.statistics.intelligence) / 20;
  }

  get supportStyle() {
    return this.model.getVariable("companionSupportStyle", DEFAULT_COMPANION_STRATEGY);
  }

  get supportedCharacter() {
    return game.player;
  }

  get threatTable() {
    if (this.supportStyle == "suppressing-fire")
      return this.supportedCharacter.script.threatTable;
    return this.model.script.threatTable;
  }

  getTargetList() {
    return uniqueArray([...super.getTargetList(), ...this.supportedCharacter.fieldOfView.getEnemies()]);
  }

  getCommandTarget() {
    switch (this.supportStyle) {
    case "fire-support":
      return this.supportedCharacter.script.lastTarget;
    case "suppressing-fire":
      return this.supportedCharacter.script.lastAttacker;
    }
    return null;
  }

  findTarget() {
    const preferred = this.getCommandTarget();
    const complianceActive = preferred && preferred.isAlive() && Math.random() < this.commandCompliance;

    this._commandTarget = complianceActive ? preferred : null;
    return super.findTarget();
  }

  scoreCandidate(candidate) {
    return super.scoreCandidate(candidate) + candidate == this._commandTarget ? this.commandBonus : 0;
  }
}
