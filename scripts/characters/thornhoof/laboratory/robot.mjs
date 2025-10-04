import {CharacterBehaviour} from "./../../character.mjs";

class Robot extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "thornhoof/laboratory/robot";
  }

  initialize() {
    this.model.statistics.meleeDamage += 3;
    this.model.statistics.damageResistance + 15;
  }
}

export function create(model) {
  return new Robot(model);
}
