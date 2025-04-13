import {CharacterBehaviour} from "../character.mjs";

export class Bartender extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "cristal-den/bartender"
  }
}
