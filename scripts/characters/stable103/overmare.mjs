import {CharacterBehaviour} from "../character.mjs";

class Character extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "stable103-overmare";
  }

  onDied() {
    level.setVariable("endGameOnExit", 1);
    super.onDied();
  }
}

export function create(model) {
  return new Character(model);
}
