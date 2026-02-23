import {CharacterBehaviour} from "./../character.mjs";
import {RoutineComponent} from "../../behaviour/routine.mjs";

export const routine = [
  { hour: "7", minute: "0", callback: "goToWork" },
  { hour: "19", minute: "29", callback: "goToHome" }
];

export default CouncilAttendant extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.routineComponent = new RoutineComponent(this, routine);
    this.routineComponent.enablePersistentRoutine();
    this.routineComponent.interrupted = !this.shouldRunRoutine;
  }

  onCharacterDetected(character) {
    if (game.getVariable("unlawfullyEnteredThornhoof", 0) == 1)
      game.diplomacy.setAsEnemy(true, "thornhoof", "player");
    return super.onCharacterDetected(character);
  }

  goToHome() {
    this.model.actionQueue.pushReachNear(this.bed, 2);
    this.model.actionQueue.start();
  }

  get shouldRunRoutine() {
    return this.model.getVariable("withRoutine", 0) == 1;
  }

  set shouldRunRoutine(value) {
    this.model.setVariable("withRoutine", value ? 1 : 0);
    this.routineComponent.interrupted = value ? false : true;
  }
}




