import {CharacterBehaviour} from "../character.mjs";

export class GipsyKin extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "cristal-den/gipsy-kin";
  }
}
