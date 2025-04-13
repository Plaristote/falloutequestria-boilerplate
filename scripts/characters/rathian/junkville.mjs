import {CharacterBehaviour} from "../character.mjs";

class Rathian extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.shouldBeAtJunkville = true;
  }

  isInWorkshop() {
    if (typeof level !== "undefined" && level.name === "junkville") {
      const zone = level.findGroup("smith").controlZone;
      return zone.isInside(this.model.position.x, this.model.position.y, this.model.floor);
    }
    return false;
  }

  get dialog() {
    if (this.isInWorkshop())
      return "rathian-junkville";
    return null;
  }
}

export function create(model) {
  console.log("CREATING JUNKVILLE RATHIAN");
  return new Rathian(model);
}
