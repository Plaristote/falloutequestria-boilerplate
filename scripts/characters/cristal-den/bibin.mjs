import {CharacterBehaviour} from "../character.mjs";

export class Bibin extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "cristal-den/bibin";
  }

  onDied() {
    game.setVariable("bibinDead", 1);
    game.dataEngine.addReputation(100, "potioks");
    super.onDied();
  }
}
