import {CharacterBehaviour} from "./../../character.mjs";

export class Matriarch extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "cristal-den/potioks/matriarch";
  }

  get speakOnDetection() {
    return this.model.getVariable("met") !== true && !this.hasPlayerBeenIntroduced;
  }

  get hasPlayerBeenIntroduced() {
    return this.model.hasVariable("sabotagePrompt");
  }
}
