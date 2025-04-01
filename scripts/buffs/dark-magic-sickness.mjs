class DarkMagicSickness {
  constructor(model) {
    this.model = model;
  }

  set modifier(value) { this.model.setVariable("modifier", value); }
  get modifier() { return this.model.getVariable("modifier"); }

  initialize() {
    this.modifier = Math.min(this.model.target.statistics.endurance, 3) - 1;
    this.model.target.statistics.endurance -= this.modifier;
  }

  finalize() {
    this.model.target.statistics.endurance += this.modifier;
  }
}

export function create(model) {
  return new DarkMagicSickness(model);
}
