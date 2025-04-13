import {CharacterBehaviour} from "./character.mjs";

class Player extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }

  getAvailableInteractions() {
    return [];
    return super.getAvailableInteractions(); // TODO
  }

  onTurnStart() {
  }

  onActionQueueCompleted() {
  }

  insertedIntoZone() {
    level.cameraFocusRequired(this.model);
  }

  get invulnerable() { return this.model.getVariable("godmode", 0) == 1; }
  set invulnerable(value) { this.model.setVariable("godmode", value ? 1 : 0); }

  mitigateDamage(damage, dealer) {
    if (dealer && this.invulnerable && damage >= this.model.statistics.hitPoints) {
      this.model.addBuff("ko");
      if (typeof dealer.script.onPlayerBeaten == "function")
        dealer.script.onPlayerBeaten();
      return 0;
    }
    return damage;
  }
}

export function create(model) {
  return new Player(model);
}
