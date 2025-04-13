import {CharacterBehaviour} from "../character.mjs";

export class Barkeep extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "hillburrow/barkeep";
  }
}
