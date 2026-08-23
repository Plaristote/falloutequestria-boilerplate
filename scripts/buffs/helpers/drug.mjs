import {StackableBuff} from "./stackable.mjs";

export default class extends StackableBuff {
  constructor(model) {
    super(model);
    this.model.tasks.addTask("trigger", this.chargeDuration, 1);
  }

  get addictionGroup() {
    return this.model.name;
  }

  get chargeDuration() {
    return this.delay * (this.hasTolerance ? 1 : 2);
  }

  get hasTolerance() {
    return this.model.target.statistics.traits.indexOf("chem-resistant") >= 0;
  }

  get isChemReliant() {
    return this.model.target.statistics.traits.indexOf("chem-reliant") >= 0;
  }

  get addictionInterval() {
    return 24 * 60 * 60 * 1000;
  }

  get addictionChancePerDose() {
    return 0.05;
  }

  get addictionChanceCap() {
    return 0.75;
  }

  get addictionLogKey() {
    return `addiction-${this.addictionGroup}-log`;
  }

  get addictionStatusKey() {
    return `addiction-${this.addictionGroup}-status`;
  }

  get withdrawalDuration() {
    return 24 * 60 * 60 * 1000;
  }

  get consumptionLog() {
    return JSON.parse(this.model.target.getVariable(this.addictionLogKey, "[]"));
  }

  set consumptionLog(value) {
    this.model.target.setVariable(this.addictionLogKey, JSON.stringify(value));
  }

  get modifierDefinitions() {
    return [];
  }

  get isAddicted() {
    return this.model.target.getVariable(this.addictionStatusKey, 0) == 1;
  }

  set isAddicted(value) {
    return this.model.target.setVariable(this.addictionStatusKey, value ? 1 : 0);
  }

  initialize() {
    super.initialize();
    this.onDoseTaken();
    this.updateModifiers();
  }
  
  repeat() {
    super.repeat();
    this.onDoseTaken();
    this.updateModifiers();
  }

  onDoseTaken() {
    this.clearWithdrawal();
    this.logConsumption();
    if (!this.isAddicted)
      this.rollForAddiction();
  }

  applyWithdrawal() {
    const modifiers = this.modifierDefinitions
      .filter(desc => desc.positive)
      .map(desc => ({statisticName: desc.statisticName, amount: desc.base}));

    if (modifiers.length > 0) {
      const withdrawal = this.model.target.addBuff("withdrawal");
      let duration = this.withdrawalDuration;

      if (this.isChemReliant)
        duration *= 0.5;
      withdrawal.script.addDrug(this.addictionGroup, modifiers, duration);
    }
  }

  clearWithdrawal() {
    const withdrawal = this.model.target.getBuff("withdrawal");
    if (withdrawal)
      withdrawal.script.removeDrug(this.addictionGroup);
  }

  logConsumption() {
    const now = game.timeManager.getTimestamp();
    const log = this.consumptionLog.filter(timestamp => now - timestamp < this.addictionInterval);

    log.push(now);
    this.consumptionLog = log;
  }

  rollForAddiction() {
    const doses = this.consumptionLog.length;
    let chance = Math.min(doses * this.addictionChancePerDose, this.addictionChanceCap);
    if (this.hasTolerance)
      chance *= 0.5;
    if (this.isChemReliant)
      chance *= 1.5;
    if (Math.random() < chance)
      this.isAddicted = true;
  }

  trigger(times) {
    this.charges -= times;
    this.updateModifiers();
    this.afterTrigger();
  }

  afterTrigger() {
    if (this.charges > 0) {
      this.model.tasks.addTask("trigger", this.chargeDuration, 1);
    } else {
      if (this.isAddicted)
        this.applyWithdrawal();
      this.model.remove();
    }
  }

  updateModifiers() {
    for (const desc of this.modifierDefinitions)
      this.updateModifier(desc.statisticName, desc.positive, desc.base, desc.limit);
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
