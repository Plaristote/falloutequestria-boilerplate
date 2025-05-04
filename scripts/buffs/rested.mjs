class Rested {
  constructor(model) {
    this.model = model;
  }

  initialize() {
    this.model.tasks.addTask("trigger", 60*60*1000, 0);
  }

  get charges() {
    return this.model.getVariable("charges", 0);
  }

  set charges(value) {
    this.removeEffects();
    this.model.setVariable("charges", Math.min(value, 10));
    this.applyEffects();
  }

  trigger() {
    if (!this.model.target.getVariable("resting", false)) {
      this.charges -= 1;
      if (this.charges <= 0) {
        this.removeEffects();
        this.model.remove();
      }
    }
  }

  applyEffects() {
    const stats = this.model.target.statistics;
    stats.maxHitPoints += this.charges;
    stats.hitPoints += this.charges;
    stats.damageResistance += Math.floor(25 * this.charges * 10) / 100;
    stats.poisonResistance += Math.floor(25 * this.charges * 10) / 100;
    stats.sequence += this.charges;
  }

  removeEffects() {
    const stats = this.model.target.statistics;
    stats.maxHitPoints -= this.charges;
    stats.hitPoints = Math.min(stats.hitPoints, stats.maxHitPoints);
    stats.damageResistance -= Math.floor(25 * this.charges * 10) / 100;
    stats.poisonResistance -= Math.floor(25 * this.charges * 10) / 100;
    stats.sequence -= this.charges;
  }
}

export function create(model) {
  return new Rested(model);
}
