import {CharacterBehaviour} from "../character.mjs";

export class Doctor extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "stable103-doctor";
  }
}
