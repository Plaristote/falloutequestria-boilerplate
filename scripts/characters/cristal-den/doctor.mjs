import {CharacterBehaviour} from "./../character.mjs";

export default class extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "cristal-den/doctor";
  }
}
