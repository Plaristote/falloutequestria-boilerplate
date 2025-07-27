import {CharacterBehaviour} from "./../../character.mjs";

class Pimp extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }
}

export function create(model) {
  return new Pimp(model);
}