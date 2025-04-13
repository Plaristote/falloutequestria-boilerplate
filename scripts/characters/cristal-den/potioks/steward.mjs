import {CharacterBehaviour} from "./../../character.mjs";

export class Steward extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "cristal-den/potioks/steward";
  }
}
