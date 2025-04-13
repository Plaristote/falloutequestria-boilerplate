import {CharacterBehaviour} from "./../character.mjs";
import {overrideBehaviour} from "../../behaviour/override.mjs";

export class BibinBodyguard extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.model.tasks.addTask("initializeCellDoorWatch", 100, 1);
  }

  initializeCellDoorWatch() {
    const door = level.findObject("hostel.cell-room.door");

    overrideBehaviour(door.script, "onUse", this.onCellDoorOpening.bind(this));
    overrideBehaviour(door.script, "onUseLockpick", this.onCellDoorOpening.bind(this));
  }

  onCellDoorOpening(user) {
    console.log("onCellDoorOpening");
    if (this.model.isAlive() && this.model.fieldOfView.isDetected(user) && this.model.hasLineOfSight(user)) {
      console.log("-> should prevent cell door from opening", this.model.fieldOfView.isDetected(user));
      level.addTextBubble(this.model, i18n.t("cristal-den-slum-bubbles.bibin-bodyguard.cell-door-forbidden"), 3500, "orange");
      return true;
    }
    return false;
  }
}
