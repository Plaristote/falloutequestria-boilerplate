import {CharacterBehaviour} from "./../../character.mjs";
import {updateDenSlaversDead} from "./denSlaversDead.mjs";

class Guard extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }

  onDied() {
    updateDenSlaversDead();
    super.onDied();
  }
}

export function create(model) {
  return new Guard(model);
}
