import {CharacterBehaviour} from "../character.mjs";
import {SquadFighterComponent} from "../components/squadFighter.mjs";

export default class CavernBandit extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.xpBaseValue = 45;
    this.squadComponent = new SquadFighterComponent(this);
  }

  onDied() {
    console.log("CavernBandit onDied");
    level.script.onBanditDied(this.model);
    super.onDied();
  }
}
