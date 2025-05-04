import {CharacterBehaviour} from "./../character.mjs";

class Innkeeper extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "cristal-den/innkeeper";
  }
}

export function create(model) {
  return new Innkeeper(model);
}
