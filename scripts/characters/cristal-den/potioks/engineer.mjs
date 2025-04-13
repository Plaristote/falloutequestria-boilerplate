import {CharacterBehaviour} from "./../../character.mjs";

class Engineer extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "cristal-den/potioks/engineer";
  }
}

export function create(model) {
  return new Engineer(model);
}
