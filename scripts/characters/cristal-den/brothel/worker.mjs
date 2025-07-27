import {CharacterBehaviour} from "./../../character.mjs";

class Worker extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }
}

export function create(model) {
  return new Worker(model);
}