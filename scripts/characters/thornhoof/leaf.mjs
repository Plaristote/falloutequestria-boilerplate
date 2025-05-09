import {CharacterBehaviour} from "./../character.mjs";

class Leaf extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }
}

export function create(model) {
  return new Leaf(model);
}