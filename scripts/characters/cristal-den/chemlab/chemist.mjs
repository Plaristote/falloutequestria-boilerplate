import {CharacterBehaviour} from "./../../character.mjs";

class Chemist extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "cristal-den/chemlab/chemist";
  }
}

export function create(model) {
  return new Chemist(model);
}
