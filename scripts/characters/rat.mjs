import {CharacterBehaviour} from "./character.mjs";
import {injectRoamTask} from "./tasks/roam.mjs";

export class Rat extends CharacterBehaviour {
  constructor(model) {
    super(model);
    injectRoamTask(this);
    this.prepareRoamTask(3);
    this.bodyDecayDuration = 60 * 60 * 36;
  }
}

export function create(model) {
  return new Rat(model);
}
