import {CharacterBehaviour} from "./../character.mjs";

class Hoarfrost extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "thornhoof/steel-ranger-agent";
  }
}

export function create(model) {
  return new Hoarfrost(model);
}
