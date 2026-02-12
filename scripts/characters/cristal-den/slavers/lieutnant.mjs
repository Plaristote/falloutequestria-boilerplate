import {CharacterBehaviour} from "./../../character.mjs";
import {updateDenSlaversDead} from "./denSlaversDead.mjs";

export class Lieutnant extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "cristal-den/slavers/lieutnant";
  }

  onDied() {
    updateDenSlaversDead();
    super.onDied();
  }
}
