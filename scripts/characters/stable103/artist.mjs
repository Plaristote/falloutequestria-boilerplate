import {CharacterBehaviour} from "../character.mjs";

class Character extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }
}

export function create(model) {
  return new Character(model);
}
