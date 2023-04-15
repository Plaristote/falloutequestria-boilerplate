import {CharacterBehaviour} from "../character.mjs";

class PotiokBoss extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "hillburrow/bitty-potiok";
  }
}

export function create(model) {
  return new PotiokBoss(model);
}
