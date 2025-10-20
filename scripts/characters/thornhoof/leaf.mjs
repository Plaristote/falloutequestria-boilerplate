import {CharacterBehaviour} from "./../character.mjs";
import {RoutineComponent} from "../../behaviour/routine.mjs";

const routine = [
  { hour: "8", name: "daily", callback: "runDailyRoutine" },
  { hour: "17", name: "night", callback: "runNightRoutine" }
];

class Leaf extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.routineComponent = new RoutineComponent(this, routine);
    this.routineComponent.enablePersistentRoutine();
    this.routineComponent.interrupted = !this.shouldRunRoutine;
  }

  get dialog() {
    return "thornhoof/leaf"; // conditional on stuff maybe
  }

  get office() {
    return level.findGroup("townhall.upper-floor.room#1");
  }

  get home() {
    return level.findGroup("residence.floor#0.appartment#2");
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
      actions.pushMovement(28, 2, 1);
      actions.start();
    }
  }

  runNightRoutine() {
    if (!level.isInsideZone(this.home.controlZone, this.model)) {
      const actions = this.model.actionQueue;
      actions.pushMovement(3, 2, 0);
      actions.start();
    }
  }
}

export function create(model) {
  return new Leaf(model);
}
