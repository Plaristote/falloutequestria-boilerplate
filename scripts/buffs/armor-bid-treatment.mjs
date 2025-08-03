const perkName = "armorBidAilments"

export default class ArmorBidTreatment {
  constructor(model) {
    this.model = model;
    this.model.tasks.addTask("trigger", 24 * 60 * 60 * 1000, 1);
  }

  initialize() {
    this.model.target.statistics.togglePerk(perkName, false);
  }

  finalize() {
    this.model.target.statistics.togglePerk(perkName, true);
  }

  trigger() {
    this.model.remove();
  }
}
