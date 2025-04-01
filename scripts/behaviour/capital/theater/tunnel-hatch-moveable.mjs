import {MovableObject} from "../../movable-object.mjs"

export class TunnelHatchMoveable extends MovableObject {
  get hatch() {
    return this.model.parent.findObject("hatch");
  }

  onMoved() {
    this.hatch.toggleSneaking(false);
  }
}
