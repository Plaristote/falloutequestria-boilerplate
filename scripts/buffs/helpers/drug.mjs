import {StackableBuff} from "./stackable.mjs";

export default class extends StackableBuff {
  constructor(model) {
    super(model);
    this.model.tasks.addTask("trigger", this.chargeDuration, 1);
  }

  get chargeDuration() {
    return this.delay * (this.hasTolerance ? 1 : 3);
  }

  get hasTolerance() {
    return this.model.target.statistics.traits.indexOf("chem-resistant") >= 0;
  }

  initialize() {
    super.initialize();
    this.updateModifiers();
  }
  
  repeat() {
    super.repeat();
    this.updateModifiers();
  }

  trigger(times) {
    this.charges -= times;
    this.updateModifiers();
    this.afterTrigger();
  }

  afterTrigger() {
    if (this.charges > 0)
      this.model.tasks.addTask("trigger", this.chargeDuration, 1);
    else
      this.model.remove();
  }

  updateModifier(statisticName, positive, base, limit) {
    const storageName     = this.storageScope + statisticName;
    const modifier        = Math.min(base * this.charges, limit);
    const currentModifier = this.model.hasVariable(storageName) ? this.model.getVariable(storageName) : 0;
    const diff            = modifier > currentModifier ? (modifier - currentModifier) : -(currentModifier - modifier);

    if (positive)
      this.model.target.statistics[statisticName] += diff;
    else
      this.model.target.statistics[statisticName] -= diff;
    this.model.setVariable(storageName, modifier);
  }
}
