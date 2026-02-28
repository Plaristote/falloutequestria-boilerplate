const defaultAgilityModifier = 1;
const defaultDamageResistanceModifier = 20;
const duration = 90*1000;

class FrostArmor {
  constructor(model) {
    this.model = model;
  }

  get agilityModifier() {
    return this.model.getVariable("agiMod", 0);
  }

  set agilityModifier(value) {
    this.model.setVariable("agiMod", value);
  }

  get damageResistanceModifier() {
    return this.model.getVariable("drMod", 0);
  }

  set damageResistanceModifier(value) {
    this.model.setVariable("drMod", value);
  }

  initialize() {
    const stats = this.model.target.statistics;
    const modifiedDamageResistance = stats.damageResistance + defaultDamageResistanceModifier
    const damageResistance = Math.min(95, modifiedDamageResistance);

    this.damageResistanceModifier = defaultDamageResistanceModifier - (modifiedDamageResistance - damageResistance);
    this.agilityModifier = stats.agility > defaultAgilityModifier ? defaultAgilityModifier : 0;
    this.applyEffects();
    this.model.tasks.addTask("wearOff", duration, 0);
  }

  applyEffects() {
    const stats = this.model.target.statistics;
    stats.damageResistance += this.damageResistanceModifier;
    stats.agility -= this.agilityModifier;
  }

  removeEffects() {
    const stats = this.model.target.statistics;
    stats.damageResistance -= this.damageResistanceModifier;
    stats.agility += this.agilityModifier;
  }

  wearOff() {
    this.removeEffects();
    this.model.remove();
  }
}

export function create(model) {
  return new FrostArmor(model);
}
