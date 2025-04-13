import {CharacterBehaviour} from "../character.mjs";

export class BibinBoxManager extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }

  get gym() {
    return this.model.parent;
  }

  get dialog() {
    if (this.gym.script.ringZone.isInside(this.model.position.x, this.model.position.y, this.model.floor))
      return null;
    return "cristal-den/boxing-manager";
  }
}
