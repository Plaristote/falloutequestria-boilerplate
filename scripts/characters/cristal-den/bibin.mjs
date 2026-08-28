import {CharacterBehaviour} from "../character.mjs";

export class Bibin extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "cristal-den/bibin";
  }

  onDied() {
    game.setVariable("bibinDead", 1);
    super.onDied();
  }
}
