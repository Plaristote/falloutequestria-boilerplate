import {CharacterBehaviour} from "./../character.mjs";

class Hoarfrost extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }
}

export function create(model) {
  return new Hoarfrost(model);
}