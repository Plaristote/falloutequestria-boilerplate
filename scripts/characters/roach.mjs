import {CharacterBehaviour} from "./character.mjs";
import {injectRoamTask} from "./tasks/roam.mjs";
import {SquadFighterComponent} from "./components/squadFighter.mjs";

export class Roach extends CharacterBehaviour {
  constructor(model) {
    super(model);
    injectRoamTask(this);
    this.prepareRoamTask(3);
    this.squadComponent = new SquadFighterComponent(this);
  }
}
