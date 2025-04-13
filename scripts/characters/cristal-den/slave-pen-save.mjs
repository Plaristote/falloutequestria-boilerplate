import {CharacterBehaviour} from "../character.mjs";

export class SlavePenSave extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }

  triggerEscape() {
    this.model.tasks.addUniqueTask("escapeTask", 3615, 0);
  }

  escapeTask() {
    const actions = this.model.actionQueue;

    this.model.movementMode = "running";
    actions.reset();
    actions.pushMovement(0, 39);
    actions.pushScript(() => {
      if (this.model.position.x == 0 && this.model.position.y == 39)
        level.deleteObject(this.model);
    });
    actions.start();
  }
}
