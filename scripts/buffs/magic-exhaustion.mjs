import {StackableBuff} from "./helpers/stackable.mjs";

const duration = 24 * 60 * 60 * 1000;
const statPenaltyPerStack = 1;

class MagicExhaustion extends StackableBuff {
  initialize() {
    super.initialize();
    this.applyPenalty();
    this.model.tasks.addTask("expire", duration);
  }

  repeat() {
    super.repeat();
    this.applyPenalty();
  }

  get removedIntelligence() { return this.model.getVariable("ri", 0); }
  set removedIntelligence(value) { this.model.setVariable("ri", value); }
  get removedEndurance() { return this.model.getVariable("re", 0); }
  set removedEndurance(value) { this.model.setVariable("re", value); }

  applyPenalty() {
    if (this.model.target.statistics.intelligence > 1) {
      this.model.target.statistics.intelligence--;
      this.removedIntelligence++;
    }
    if (this.model.target.statistics.endurance > 1) {
      this.model.target.statistics.endurance--;
      this.removedEndurance++;
    }
  }

  expire() {
    console.log("MAGIC EXHAUSTION EXPIRE", this.charges, this.removedIntelligence, this.removedEndurance);
    this.charges--;
    while (this.removedIntelligence && this.charges >= this.removedIntelligence) {
      this.model.target.statistics.intelligence++;
      this.removedIntelligence--;
    }
    while (this.removedEndurance && this.charges >= this.removedEndurance) {
      this.model.target.statistics.endurance++;
      this.removedEndurance--;
    }
    if (this.charges === 0)
      this.model.remove();
  }
}

export function create(model) {
  return new MagicExhaustion(model);
}
