import {MovableObject} from "../movable-object.mjs";

export default class extends MovableObject {
  constructor(model) {
    super(model);
    this.moveDifficulty = 3;
  }

  get targetPosition() {
    return { x: 13, y: 35 };
  }

  onZoneEntered(character) {
    if (character ===  game.player) this.model.interactive = true;
  }

  onZoneExited(character) {
    if (character ===  game.player) this.model.interactive = false;
  }

  onMoved() {
    super.onMoved();
    level.deleteObject(level.findObject("floor-0.secret-entrance-blocker"));
  }
}
