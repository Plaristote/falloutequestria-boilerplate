import {CharacterBehaviour} from "./../character.mjs";

class Beryl extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }
}

export function create(model) {
  return new Beryl(model);
}