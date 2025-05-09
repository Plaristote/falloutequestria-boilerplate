import {CharacterBehaviour} from "./../character.mjs";

class Scroll extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "thornhoof/scroll";
  }
}

export function create(model) {
  return new Scroll(model);
}
