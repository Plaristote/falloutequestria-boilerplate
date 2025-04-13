import {CharacterBehaviour} from "./../../character.mjs";

export class Singer extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "capital/theater/singer";
  }
}
