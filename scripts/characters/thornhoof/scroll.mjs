import {CharacterBehaviour} from "./../character.mjs";
import {RoutineComponent} from "../../behaviour/routine.mjs";

const routine = [
  { hour: "7", name: "daily", callback: "runDailyRoutine" },
  { hour: "20", name: "night", callback: "runNightRoutine" }
];

class Scroll extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.routineComponent = new RoutineComponent(this, routine);
    this.routineComponent.enablePersistentRoutine();
    this.routineComponent.interrupted = !this.shouldRunRoutine;
    this.dialog = "thornhoof/scroll";
  }

  get office() {
    return level.findGroup("townhall.upper-floor.room#2");
  }

  get home() {
    return level.findGroup("residence.floor#2.room");
  }

  get shouldRunRoutine() {
    return this.model.getVariable("withRoutine", 0) == 1;
  }

  set shouldRunRoutine(value) {
    this.model.setVariable("withRoutine", value ? 1 : 0);
    this.routineComponent.interrupted = value ? false : true;
  }

  runDailyRoutine() {
    if (!level.isInsideZone(this.office.controlZone, this.model)) {
      const actions = this.model.actionQueue;
      actions.pushMovement(34, 3, 1);
      actions.start();
    }
  }

  runNightRoutine() {
    if (!level.isInsideZone(this.home.controlZone, this.model)) {
      const actions = this.model.actionQueue;
      actions.pushMovement(5, 3, 2);
      actions.start();
    }
  }
}

export function create(model) {
  return new Scroll(model);
}
