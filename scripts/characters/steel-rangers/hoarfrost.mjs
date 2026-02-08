import CharacterBehaviour from "../thornhoof/council-routine.mjs";

export default class Hoarfrost extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "thornhoof/steel-ranger-agent";
  }

  get bed() {
    return level.findObject("residence.floor#0.appartment#1.bed");
  }

  goToWork() {
    this.model.actionQueue.pushMovement(34, 7, 0);
    this.model.actionQueue.start();
  }
}
