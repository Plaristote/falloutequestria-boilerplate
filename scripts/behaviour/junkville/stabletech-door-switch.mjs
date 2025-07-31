export class StabletechDoorSwitch {
  constructor(model) {
    this.model = model;
  }

  getAvailableInteractions() {
    return ["use", "look"];
  }

  onUse() {
    const door = level.findObject("stabletech-facility.door-interior");

    door.locked = false;
    door.open = true;
    door.script.moveRathianToNextRoom();
  }
}
