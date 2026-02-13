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

  goToSlaveRiot() {
    this.model.actionQueue.pushReachNear(27, 19, 0, 4);
    this.model.actionQueue.start();
  }

  onSlaveRiot() {
    this.model.actionQueue.reset();
    this.model.actionQueue.pushWait(8);
    this.goToSlaveRiot();
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
