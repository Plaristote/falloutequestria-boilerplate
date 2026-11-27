import {notifyPotiokDeath} from "../../../quests/cristal-den/potioks.mjs";
import {CharacterBehaviour} from "./../../character.mjs";

export default class extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "cristal-den/potioks/engineer";
  }

  onDied() {
    game.setVariable("potiokCraftyDead", 1);
    notifyPotiokDeath();
    super.onDied();
  }
}
