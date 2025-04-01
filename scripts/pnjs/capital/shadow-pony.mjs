import {CharacterBehaviour} from "../character.mjs";
import {injectRoamTask} from "../tasks/roam.mjs";

export class ShadowPony extends CharacterBehaviour {
  constructor(model) {
    super(model);
    injectRoamTask(this);
    this.prepareRoamTask(3);
  }
}
