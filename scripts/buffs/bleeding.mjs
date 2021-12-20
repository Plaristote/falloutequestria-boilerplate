class Bleeding {
  constructor(model) {
    console.log("Bleeding buff constructed");
    this.model = model;
  }

  initialize() {
    console.log("Bleeding buff initialized");
    this.model.setVariable("charges", 10);
    this.model.tasks.addTask("trigger", 1000, 0);
  }

  restart() {
    this.model.setVariable("charges", 10);
  }

  trigger() {
    console.log("Bleeding buff triggered");
    const remainingCharges = this.model.getVariable("charges") - 1;

    if (remainingCharges > 0) {
      this.model.target.takeDamage(1, null);
      this.model.setVariable("charges", remainingCharges);
    }
    else
      this.model.remove();
  }
}

export function create(model) {
  return new Bleeding(model);
}
