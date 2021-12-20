import {CharacterBehaviour} from "../character.mjs";

class Secretary extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "town-secretary";
  }
}

export function create(model) {
  return new Secretary(model);
}
