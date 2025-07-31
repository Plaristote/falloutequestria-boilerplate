import {VaultDoor} from "../vault-door.mjs";
import {getRathian} from "../../characters/rathian/template.mjs";

export default class extends VaultDoor {
  onBustOpen(damage) {
    this.model.tasks.addTask("moveRathianToNextRoom", 100, 1);
    return true;
  }

  moveRathianToNextRoom() {
    const rathian = getRathian();

    if (rathian)
      rathian.script.onSurfaceMainRoomDoorOpened();
  }
}
