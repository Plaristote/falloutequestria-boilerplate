import {CharacterBehaviour} from "./character.mjs";
import {injectRoamTask} from "./tasks/roam.mjs";

export default class FeralGhoul extends CharacterBehaviour {
  constructor(model) {
    super(model);
    injectRoamTask(this);
    this.prepareRoamTask(10);
  }
}
