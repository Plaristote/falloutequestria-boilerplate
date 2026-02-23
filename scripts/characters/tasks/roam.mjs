import {randomInterval} from "../../behaviour/random.mjs";

class RoamTask {
  constructor(parent) {
    this.parent = parent;
    this.model = parent.model;
  }

  prepare(minInterval, maxInterval) {
    this.preparePosition();
    this.interval(minInterval, maxInterval);
  }

  preparePosition() {
    if (this.model.position.x != -1 && this.model.position.y != -1) {
      this.model.setVariable("roamX", this.model.position.x);
      this.model.setVariable("roamY", this.model.position.y);
      return true;
    }
    return false;
  }

  start() {
    this.model.setVariable("roamEnabled", 1);
    this.schedule();
  }

  terminate() {
    this.model.unsetVariable("roamEnabled");
    this.model.tasks.removeTask("roamTask");
  }

  interval(min, max) {
    this.model.setVariable("roamMin", min);
    this.model.setVariable("roamMax", max);
  }

  schedule() {
    const minInterval = this.model.getVariable("roamMin");
    const maxInterval = this.model.getVariable("roamMax");
    const interval    = randomInterval(minInterval * 1000, maxInterval * 1000);

    this.model.tasks.addUniqueTask("_roamTask", Math.floor(interval), 1);
  }

  exists() {
    return this.model.hasVariable("roamEnabled");
  }

  prepared() {
    return this.model.hasVariable("roamX") || this.preparePosition();
  }

  run() {
    if (this.exists()) {
      if (!level.isInCombat(this.model) && this.model.actionQueue.isEmpty() && this.prepared()) {
        const center = {
          x: this.model.getVariable("roamX"),
          y: this.model.getVariable("roamY")
        };

        this.model.actionQueue.pushReachNear(center.x, center.y, this.range);
        this.model.actionQueue.start();
      }
      this.schedule();
    }
  }
}

function prepareRoamTask(range, minInterval = 5, maxInterval = 15) {
  this.roamTask = new RoamTask(this);
  this.roamTask.range = range;
  if (!this.roamTask.exists()) {
    this.roamTask.prepare(range, minInterval, maxInterval);
    this.roamTask.start();
  }
  else {
    this.roamTask.range = range;
    this.roamTask.interval(minInterval, maxInterval);
  }
}

function roamTask() {
  this.roamTask.run();
}

export function injectRoamTask(object) {
  const onDiedBackup = object.onDied;

  object.prepareRoamTask =  prepareRoamTask.bind(object);
  object._roamTask = roamTask.bind(object);
  object.onDied = function() {
    onDiedBackup.bind(object)();
    object.roamTask.terminate();
  };
}
