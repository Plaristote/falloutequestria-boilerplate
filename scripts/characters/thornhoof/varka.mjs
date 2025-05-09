import {CharacterBehaviour} from "./../character.mjs";

class Varka extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }
}

export function create(model) {
  return new Varka(model);
}