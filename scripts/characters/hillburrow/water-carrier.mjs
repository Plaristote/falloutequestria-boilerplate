import {CharacterBehaviour} from "../character.mjs";
import {RoutineComponent} from "../../behaviour/routine.mjs";

const homeTask               = { from: { hour: 21, minute: 0 },  to: { hour: 14, minute: 15 }, task: "home" };
const carryWaterEntranceTask = { from: { hour: 14, minute: 15 }, to: { hour: 15, minute: 0 }, task: "carryWaterEntrance" };
const carryWaterBacktownTask = { from: { hour: 15, minute: 0 },  to: { hour: 18, minute: 0 }, task: "carryWaterBacktown"};
const drinkTask              = { from: { hour: 18, minute: 0 },  to: { hour: 21, minute: 0 }, task: "drink" };

const tasks = { "carryWaterEntrance": carryWaterEntranceTask, "carryWaterBacktown": carryWaterBacktownTask, "home": homeTask, "drink": drinkTask };

export const waterCarrierAppearences = {
  "hillburrow-source":   [homeTask],
  "hillburrow-entrance": [carryWaterEntranceTask, drinkTask],
  "hillburrow-backtown": [carryWaterBacktownTask]
};

export const waterCarrierPopPositions = {
  "carryWaterEntrance": { x: 4,  y: 15, z: 0 },
  "carryWaterBacktown": { x: 28, y: 55, z: 0 },
  "drink":              { x: 58, y: 0,  z: 0 },
  "home":               { x: 84, y: 0,  z: 0 }
};

export const waterCarrierLeavePositions = {
  "carryWaterEntrance": { x: 49, y: 0, z: 0 },
  "carryWaterBacktown": { x: 35, y: 59, z: 0 },
  "drink":              { x: 0, y: 15, z: 0 },
  "home":               { x: 84, y: 0, z: 0 }
};

function scheduleNextStep() {
  this.model.actionQueue.pushWait(10);
  this.model.actionQueue.pushScript(() => { this.currentTaskStep++; });
}

function scheduleReachCaseStep(x, y, range) {
  this.model.actionQueue.pushReachCase(x, y, range);
  scheduleNextStep.bind(this)();
  this.model.actionQueue.start();
}

const taskSteps = {
  "carryWaterEntrance": [
    function() { scheduleReachCaseStep.bind(this)(16, 55, 2); },
    function() { scheduleReachCaseStep.bind(this)(44, 71, 3); },
    function() { scheduleReachCaseStep.bind(this)(19, 28, 3); },
    function() { scheduleReachCaseStep.bind(this)(38, 42, 3); }
  ],
  "carryWaterBacktown": [
    function() { scheduleReachCaseStep.bind(this)(75, 37, 3); },
    function() { scheduleReachCaseStep.bind(this)(82, 20, 3); },
    function() { scheduleReachCaseStep.bind(this)(75, 6, 3); },
    function() { scheduleReachCaseStep.bind(this)(18, 9, 3); }
  ],
  "drink": [
    function() { scheduleReachCaseStep.bind(this)(40, 44, 3); }
  ],
  "home": [
    function() { scheduleReachCaseStep.bind(this)(25, 2, 2); }
  ]
};

export class WaterCarrier extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "hillburrow/water-carrier";
  }

  initialize() {
    this.model.tasks.addUniqueTask("routine", 6789, 0);
  }

  get currentTask() {
    return this.model.getVariable("currentTask");
  }

  set currentTask(taskName) {
    const task = tasks[taskName];
    const taskEnd = game.timeManager.secondsUntilTime(task.to);

    this.model.setVariable("currentTask", taskName);
    this.currentTaskStep = 0;
    this.model.tasks.addTask(taskName + "Leave", taskEnd * 1000, 1);
  }

  get currentTaskStep() {
    return this.model.getVariable("currentTaskStep");
  }

  set currentTaskStep(value) {
    this.model.setVariable("currentTaskStep", value);
  }

  routine() {
    if (this.model.actionQueue.isEmpty())
      this.runRoutineStep();
  }

  runRoutineStep() {
    console.log(this.model, "runRoutineStep", this.currentTask, this.currentTaskStep);
    if (this.currentTask && this.currentTaskStep >= 0) {
      const taskFunction = taskSteps[this.currentTask][this.currentTaskStep];

      console.log("runRoutineStep func", taskFunction);
      if (taskFunction)
        taskFunction.bind(this)();
    }
  }

  carryWaterEntranceLeave() {
    this.leaveTask(waterCarrierLeavePositions.carryWaterEntrance, "carryWaterEntranceLeave");
  }

  carryWaterBacktownLeave() {
    this.leaveTask(waterCarrierLeavePositions.carryWaterBacktown, "carryWaterBacktownLeave");
  }

  drinkLeave() {
    this.leaveTask(waterCarrierLeavePositions.drink, "drinkLeave");
  }

  homeLeave() {
    this.leaveTask(waterCarrierLeavePositions.home, "homeLeave");
  }

  leaveTask(leavePosition, leaveMethod) {
    const character = this.model;

    this.model.actionQueue.reset();
    this.model.actionQueue.pushMovement(leavePosition.x, leavePosition.y, leavePosition.z);
    this.model.actionQueue.pushScript(() => {
      if (this.model.position.x != leavePosition.x || this.model.position.y != leavePosition.y) {
        console.log("Cannot depop water carrier yet, not in appropriate position", leaveMethod);
        this.model.tasks.addTask(leaveMethod, 1000);
      }
      else {
        game.uniqueCharacterStorage.saveCharacterFromCurrentLevel(character);
      }
    });
    this.model.actionQueue.start();
  }
}
