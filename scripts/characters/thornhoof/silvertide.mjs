import {CharacterBehaviour} from "./../character.mjs";

class Silvertide extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "thornhoof/silvertide";
  }

  get metPlayer() {
    return this.model.getVariable("met", 0) == 1;
  }

  set metPlayer(value) {
    this.model.setVariable("met", value ? 1 : 0);
  }

  get speakOnDetection() {
    return !this.metPlayer;
  }
}

export function create(model) {
  return new Silvertide(model);
}
