export class GuardComponent {
  constructor(parent) {
    this.parent   = parent;
    this.model    = parent.model;
    this.taskName = "guardingTask";
    if (!this.model.hasVariable("guardX"))
      this.initialize();
    parent[this.taskName] = this.task.bind(this);
  }

  initialize() {
    this.model.setVariable("guardX", this.model.position.x);
    this.model.setVariable("guardY", this.model.position.y);
    this.model.setVariable("guardZ", this.model.floor);
    this.enable();
  }

  isAtGuardPosition() {
    return this.model.getVariable("guardX") === this.model.position.x
        && this.model.getVariable("guardY") === this.model.position.y
        && this.model.getVariable("guardZ") === this.model.floor
  }
  
  shouldReachGuardPosition() {
    return this.model.actionQueue.isEmpty()
       && !this.isAtGuardPosition()
       && !this.model.tasks.hasTask("alarmTask");
  }

  task() {
    if (this.shouldReachGuardPosition()) {
      this.model.movementMode = "walking";
      this.model.actionQueue.pushReachCase(
        this.model.getVariable("guardX"),
        this.model.getVariable("guardY"),
        this.model.getVariable("guardZ"),
        0
      );
      this.model.actionQueue.start();
    }
  }

  enable() {
    this.model.tasks.addUniqueTask(this.taskName, 15000, 0);
  }

  disable() {
    this.model.tasks.removeTask(this.taskName);
  }
}
