import {CharacterBehaviour} from "../character.mjs";
import {MercenaryRiotComponent} from "./mercenary-riot-component.mjs";

class MercenaryBoss extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "hillburrow/mercenary-boss";
    this.riotComponent = new MercenaryRiotComponent(this);
  }
}

export function create(model) {
  return new MercenaryBoss(model);
}
