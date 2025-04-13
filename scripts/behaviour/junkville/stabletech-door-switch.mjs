import {getRathian} from "../../characters/rathian/template.mjs";

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
    this.moveRathianToNextRoom();
  }

  moveRathianToNextRoom() {
    const rathian = getRathian();

    if (rathian)
      rathian.getScriptObject().onSurfaceMainRoomDoorOpened();
  }
}
