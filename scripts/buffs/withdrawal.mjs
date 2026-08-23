export default class {
  constructor(model) {
    this.model = model;
    this.model.tasks.addTask("tick", this.tickInterval, 0);
  }

  get tickInterval() {
    return 60 * 1000;
  }

  get drugs() {
    return JSON.parse(this.model.getVariable("drugs", "{}"));
  }

  set drugs(value) {
    this.model.setVariable("drugs", JSON.stringify(value));
  }

  addDrug(drugName, modifiers, duration) {
    const drugs = this.drugs;

    if (drugs[drugName])
      this.revertEntry(drugs[drugName]);
    drugs[drugName] = {modifiers: this.applyModifiers(modifiers), remaining: duration};
    this.drugs = drugs;
  }

  removeDrug(drugName) {
    const drugs = this.drugs;
    const entry = drugs[drugName]

    if (entry) {
      this.revertEntry(entry);
      delete drugs[drugName];
      this.drugs = drugs;
      if (Object.keys(drugs).length === 0)
        this.model.remove();
    }
  }

  tick(times) {
    const drugs   = this.drugs;
    const elapsed = times * this.tickInterval;

    for (const drugName of Object.keys(drugs)) {
      const entry = drugs[drugName];
      entry.remaining -= elapsed;
      if (entry.remaining <= 0) {
        this.revertEntry(entry);
        this.cureAddiction(drugName);
        delete drugs[drugName];
      }
    }
    this.drugs = drugs;
    if (Object.keys(drugs).length === 0)
      this.model.remove();
  }

  cureAddiction(drugName) {
    this.model.target.setVariable(`addiction-${drugName}-status`, 0);
  }

  applyModifiers(modifiers) {
    return modifiers.map(modifier => {
      const current       = this.model.target.statistics[modifier.statisticName];
      const appliedAmount = Math.max(0, Math.min(modifier.amount, current - 1));

      this.model.target.statistics[modifier.statisticName] -= appliedAmount;

      return {statisticName: modifier.statisticName, amount: appliedAmount};
    });
  }

  revertEntry(entry) {
    for (const {statisticName, amount} of entry.modifiers)
      this.model.target.statistics[statisticName] += amount;
  }
}
