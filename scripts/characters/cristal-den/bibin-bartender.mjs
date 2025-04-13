import {CharacterBehaviour} from "./../character.mjs";

export class BibinBartender extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "cristal-den/bibin-bartender";
  }
}
