import Base from "./base.mjs";

export default class Rathian extends Base {
  isInWorkshop() {
    if (typeof level !== "undefined" && level.name === "junkville") {
      const zone = level.findGroup("smith").controlZone;
      return zone.isInside(this.model.position.x, this.model.position.y, this.model.floor);
    }
    return false;
  }

  get dialog() {
    if (this.isInWorkshop())
      return "rathian-junkville";
    return null;
  }

  moveToHome() {
    if (this.model.actionQueue.isEmpty()) {
      this.model.actionQueue.pushMovement(53, 27);
      this.model.actionQueue.start();
    }
  }
}

export function create(model) {
  console.log("CREATING JUNKVILLE RATHIAN");
  return new Rathian(model);
}
