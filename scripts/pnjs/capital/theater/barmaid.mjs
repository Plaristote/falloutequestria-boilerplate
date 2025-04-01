import {CharacterBehaviour} from "./../../character.mjs";

export class Barmaid extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "capital/theater/barmaid";
  }
}
