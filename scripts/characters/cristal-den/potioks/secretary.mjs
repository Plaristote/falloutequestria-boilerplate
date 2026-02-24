import {CharacterBehaviour} from "./../../character.mjs";

export class Secretary extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }

  get dialog() {
    if (this.model.hasVariable("matriarchDeathNoticed"))
      return null;
    return "cristal-den/potioks/secretary";
  }

  onMatriarchDeathNoticed() {
    this.model.setVariable("matriarchDeathNoticed", 1)
  }
}
