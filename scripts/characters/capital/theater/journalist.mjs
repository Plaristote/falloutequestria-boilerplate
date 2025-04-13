import {CharacterBehaviour} from "./../../character.mjs";

export class Journalist extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "capital/theater/journalist";
  }

  get speakOnDetection() {
    return !this.model.hasVariable("met");
  }
}
