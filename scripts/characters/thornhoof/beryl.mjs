import CharacterBehaviour from "./council-routine.mjs";

export default class Beryl extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }

  get bed() {
    return level.findObject("residence.floor#0.appartment#2.bed");
  }

  goToWork() {
    this.model.actionQueue.pushMovement(37, 3, 0);
    this.model.actionQueue.start();
  }
}
