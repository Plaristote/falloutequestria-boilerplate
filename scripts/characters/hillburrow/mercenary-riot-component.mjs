import * as Quest from "../../quests/hillburrow/slaveRiot.mjs";

export class MercenaryRiotComponent {
  constructor(parent) {
    this.parent = parent;
    this.model = parent.model;
    ["onSlaveRiot", "slaveRiotTask", "searchForNextCombatTarget"].forEach(method => {
      parent[method] = this[method].bind(this);
    });
  }

  get ongoingRiot() {
    return Quest.getState() == Quest.states.Rioting;
  }

  onSlaveRiot() {
    level.joinCombat(this.model);
  }

  slaveRiotTask() {
    if (!this.isBusy) {
      this.model.actionQueue.reset();
      this.goToSlaveRiot();
    }
  }

  searchForNextCombatTarget() {
    if (this.ongoingRiot) {
      const slaves = level.find("slaves.*");

      if (slaves.length) {
        const it = Math.floor(Math.random() * slaves.length);
        return slaves[it];
      }
      return game.player;
    }
    return this.parent.defaultCombatTargetLookup();
  }
}
