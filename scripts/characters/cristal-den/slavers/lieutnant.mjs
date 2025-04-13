import {CharacterBehaviour} from "./../../character.mjs";

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
