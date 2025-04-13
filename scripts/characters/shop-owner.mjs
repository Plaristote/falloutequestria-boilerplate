import {CharacterBehaviour} from "./character.mjs";

export class ShopOwner extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }

  initialize() {
    this.model.setVariable("workPosition", JSON.stringify({
      x: this.model.position.x, y: this.model.position.y, z: this.model.floor
    }));
  }

  get shop() {
    return this.model.parent;
  }

  get workPosition() {
    return JSON.parse(this.model.getVariable("workPosition"));
  }

  goToWork() {
    const t = this.workPosition;
    this.model.actionQueue.pushReachCase(t.x, t.y, t.z, 0);
    this.model.actionQueue.start();
  }

  goToSleep() {
    const bed = this.bed;
    if (bed) {
      this.model.actionQueue.pushReach(bed);
      this.model.actionQueue.start();
    } else {
      console.log("(!) Shop owner has no bed: ", this.model.path);
    }
  }

  isAtWork() {
    const t = this.workPosition;
    return this.model.position.x == t.x && this.model.position.y == t.y && this.model.floor == t.z;
  }

  isAtHome() {
    return true;
  }

  onActionQueueCompleted() {
    if (!level.combat) {
      if (this.shop.script.opened && !this.isAtWork())
        this.model.tasks.addTask("goToWork", 1000);
      if (!this.shop.script.opened && !this.isAtHome())
        this.model.tasks.addTask("goToSleep", 1000);
    }
    super.onActionQueueCompleted();
  }
}
