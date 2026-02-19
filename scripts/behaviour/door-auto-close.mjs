import {Door} from "./door.mjs";

const autocloseDelay = 8500;
const autocloseMethod = "autoclose";
const autocloseDisableVar = "autoclose-disabled";

export class AutoClosingDoor extends Door {
  constructor(model) {
    super(model);
    if (!model.tasks.hasTask(autocloseMethod) && this.model.opened)
      model.tasks.addTask(autocloseMethod, autocloseDelay, 1);
  }

  autoclose(a, b, c, d) {
    if (!this.model.destroyed && this.model.opened && !this.model.hasVariable(autocloseDisableVar)) {
      this.model.tasks.addTask(autocloseMethod, autocloseDelay, 1);
      this.model.opened = false;
    }
  }

  onUse() {
    if (this.model.tasks.hasTask(autocloseMethod))
      this.model.tasks.removeTask(autocloseMethod);
    this.model.tasks.addTask(autocloseMethod, autocloseDelay, 1);
  }
  
  disableAutoclose() {
    this.model.setVariable(autocloseDisableVar, 1);
  }
  
  enableAutoclose() {
    this.model.unsetVariable(autocloseDisableVar);
    this.model.tasks.addTask(autocloseMethod, autocloseDelay, 1);
  }
}

export function create(model) {
  return new AutoClosingDoor(model);
}
