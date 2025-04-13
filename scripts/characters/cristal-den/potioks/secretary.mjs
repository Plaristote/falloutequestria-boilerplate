import {CharacterBehaviour} from "./../../character.mjs";

export class Secretary extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "cristal-den/potioks/secretary";
  }
}
