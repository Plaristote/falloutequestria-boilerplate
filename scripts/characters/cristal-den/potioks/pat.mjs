import {CharacterBehaviour} from "./../../character.mjs";

export default class extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "cristal-den/potioks/pat";
  }

  onDied() {
    game.setVariable("potiokPatDead", 1);
    super.onDied();
  }
}

