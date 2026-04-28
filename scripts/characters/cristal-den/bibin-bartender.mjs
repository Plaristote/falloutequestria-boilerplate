import {CharacterBehaviour} from "./../character.mjs";
import {finishedAllQuests} from "./../../quests/cristal-den/bibins-meta.mjs";

export class BibinBartender extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "cristal-den/bibin-bartender";
  }

  get merchantDiscount() {
    return finishedAllQuests() ? 0.3 : 0;
  }
}
