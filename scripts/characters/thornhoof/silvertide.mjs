import {CharacterBehaviour} from "./../character.mjs";

class Silvertide extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "thornhoof/silvertide";
  }

  get metPlayer() {
    return this.model.getVariable("met", 0) == 1;
  }

  get speakOnDetection() {
    return !this.metPlayer;
  }

  get shouldBeAtThornhoofEntrance() {
    return this.model.isAlive();
  }
}

export function create(model) {
  return new Silvertide(model);
}
