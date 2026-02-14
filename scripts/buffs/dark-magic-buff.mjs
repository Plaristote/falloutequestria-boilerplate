class DarkMagicBuff {
  constructor(model) {
    this.model = model;
    this.model.hudVisible = false;
  }

  set modifier(value) { this.model.setVariable("modifier", value); }
  get modifier() { return this.model.getVariable("modifier"); }

  initialize() {
    this.model.target.statistics.strength += 1;
    this.model.target.statistics.spellcasting += 20;
  }

  finalize() {
    this.model.target.statistics.strength -= 1;
    this.model.target.statistics.spellcasting -= 20;
  }
}

export function create(model) {
  return new DarkMagicBuff(model);
}
