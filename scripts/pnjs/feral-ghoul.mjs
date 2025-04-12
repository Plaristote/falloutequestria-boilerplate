import {CharacterBehaviour} from "./../character.mjs";
import {injectRoamTask} from "./tasks/roam.mjs";

class FeralGhoul extends CharacterBehaviour {
  constructor(model) {
    super(model);
    injectRoamTask(this);
    this.prepareRoamTask(10);
  }
}

export function create(model) {
  return new FeralGhoul(model);
}
