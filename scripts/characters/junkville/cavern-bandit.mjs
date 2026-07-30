import {CharacterBehaviour} from "../character.mjs";

export default class CavernBandit extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.xpBaseValue = 45;
  }

  onDied() {
    console.log("CavernBandit onDied");
    level.script.onBanditDied(this.model);
    super.onDied();
  }
}
