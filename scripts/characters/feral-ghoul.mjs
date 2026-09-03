import {CharacterBehaviour} from "./character.mjs";
import {injectRoamTask} from "./tasks/roam.mjs";
import TargetSelector from "./components/combat/target-selector.mjs";

class GhoulTargetSelector extends TargetSelector {
  scoreCandidate(candidate) {
    if (candidate && candidate.characterSheet == "capital/shadow-pony")
      return 0;
    return super.scoreCandidate(candidate);
  }
}

export default class FeralGhoul extends CharacterBehaviour {
  constructor(model) {
    super(model);
    injectRoamTask(this);
    this.prepareRoamTask(10);
    this.xpBaseValue = 60;
    this.targetSelector = new GhoulTargetSelector(this);
  }

  get hasWillToFight() {
    if (this.hasCombatTarget() && this.combatTarget.characterSheet == "capital/shadow-pony")
      return false;
    return this.model.morale > 0 || this.moraleImmune;
  }
}
