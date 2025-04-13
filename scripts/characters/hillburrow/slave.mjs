import {CharacterBehaviour} from "../character.mjs";
import {RoutineComponent} from "../../behaviour/routine.mjs";
import {routine} from "./slave-routine.mjs";
import * as SlaveRiot from "../../quests/hillburrow/slaveRiot.mjs";

function findBed() {
  const beds = level.find("house.slave-pen.bed*");
  const randomIt = Math.floor(Math.random() * beds.length);
  return beds[randomIt];
}

export class Slave extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.routineComponent = new RoutineComponent(this, routine);
  }

  initialize() {
    this.model.setVariable("workX", this.model.position.x);
    this.model.setVariable("workY", this.model.position.y);
    this.model.tasks.addTask("postInitialize", 100);
    this.model.tasks.addUniqueTask("runRoutine", Math.random() * 5000 + 5000, 0);
  }

  postInitialize() {
    this.model.setVariable("bed", findBed().path);
  }

  runRoutine() {
    if (SlaveRiot.getState() < SlaveRiot.states.Rioting) {
      switch (this.routineComponent.getCurrentRoutine().callback) {
        case "dayShift":   return !this.isBusy && this.goToWorkStation();
        case "nightShift": return !this.isBusy && this.goToBed();
      }
    }
  }

  goToWorkStation() {
    this.model.actionQueue.pushMovement(...this.workPosition);
    this.model.actionQueue.start();
  }

  goToBed() {
    this.model.actionQueue.pushReach(this.bed);
    this.model.actionQueue.start();
  }

  get workPosition() {
    return this.model.getVariables(["workX", "workY"]).concat(0);
  }

  get isInPen() {
    const pen = level.findGroup("house.slave-pen");
    return pen && pen.controlZone.isInside(this.model.position.x, this.model.position.y, 0);
  }

  get isAtWork() {
    const expected = this.workPosition;
    return this.model.position.x == expected[0] && this.model.position.y == expected[1];
  }

  get bed() {
    return level.findObject(this.model.getVariable("bed"));
  }
}
