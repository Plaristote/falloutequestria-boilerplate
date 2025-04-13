import {CharacterBehaviour} from "./../../character.mjs";
import {updateDenSlaversDead} from "./denSlaversDead.mjs";

export class Boss extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "cristal-den/slavers/boss";
    this.speakOnDetection = true;
  }

  onDied() {
    updateDenSlaversDead();
    super.onDied();
  }
}
