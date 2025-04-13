import {CharacterBehaviour} from "../character.mjs";
import {GuardBehaviour} from "../guard.mjs";
import {GuardComponent} from "../components/guard.mjs";
import {RoutineComponent} from "../../behaviour/routine.mjs";
import {MercenaryRiotComponent} from "./mercenary-riot-component.mjs";

const routine = [
  { hour: "9", minute: "30", callback: "startDayShift" },
  { hour: "21", minute: "30", callback: "startNightShift" }
];

const guardPosts = {
  "1": [32, 38, 0],
  "2": [34, 38, 0],
  "3": [29, 33, 0],
  "4": [33, 23, 0],
  "5": [39, 27, 0]
};

function initializeGuardPost(guard) {
  if (guard.isDayShifter() || guard.isNightShifter()) {
    const number = guard.model.objectName.slice(-1);
    const position = guardPosts[number];

    guard.model.setVariable("guardX", position[0]);
    guard.model.setVariable("guardY", position[1]);
    guard.model.setVariable("guardZ", position[2]);
  }
}

class Mercenary extends GuardBehaviour {
  constructor(model) {
    super(model);
    this.guardComponent = new GuardComponent(this);
    this.routineComponent = new RoutineComponent(this, routine);
    this.riotComponent = new MercenaryRiotComponent(this);
  }

  initialize() {
    initializeGuardPost(this);
  }

  onLook() {
    if (this.isDayShifter())
      game.appendToConsole("day shifter");
    else
      game.appendToConsole("night sifter");
    return super.onLook();
  }

  get squad() {
    let guards = [];

    for (var group in level.findGroup("guards").groups) {
      for (var guard in group.objects) guards.push(guard);
    }
    return guard;
  }

  isDayShifter() {
    return this.model.parent.name == "day-shift";
  }

  isNightShifter() {
    return this.model.parent.name == "night-shift";
  }

  isSlaveGuard() {
    return this.model.parent.name == "slave-guards";
  }

  startDayShift() {
    if (this.isDayShifter() || this.isSlaveGuard())
      this.goToGuard();
    else
      this.goToSleep();
  }

  startNightShift() {
    if (this.isNightShifter())
      this.goToGuard();
    else
      this.goToSleep();
  }

  goToGuard() {
    this.guardComponent.enable();
    this.model.tasks.removeTask("moveTowardsBedroom");
  }

  goToSleep() {
    this.guardComponent.disable();
    this.model.tasks.addTask("moveTowardsBedroom", Math.random() * 9000, 60);
  }

  moveTowardsBedroom() {
    // DONE how about implementing a way to get a random case from a ZoneComponent ?
    // TODO use getRandomZonePosition here
    if (this.model.actionQueue.isEmpty()) {
      this.model.actionQueue.pushReachNear(43, 29, 1, 5);
      this.model.actionQueue.start();
    }
  }

  onGuardTask() {
    if (this.isDayShifter())
      console.log("GUARD TASK triggered on day shifter");
    if (this.isNightShifter())
      console.log("GUARD TASK triggered on night shifter");
  }
}

export function create(model) {
  return new Mercenary(model);
}
