import {CharacterBehaviour} from "../character.mjs";
import {RoutineComponent} from "../../behaviour/routine.mjs";
import {routine, initializeRoutineUser} from "./resident-routine.mjs";
import {assemblyTalkBubbles} from "./assembly.mjs";

export class Resident extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.routineComponent = new RoutineComponent(this, routine);
  }

  initialize() {
    initializeRoutineUser(this.model);
  }

  // Only talkative during the communal assembly (undefined otherwise)
  get textBubbles() {
    return assemblyTalkBubbles(this.model);
  }
}
