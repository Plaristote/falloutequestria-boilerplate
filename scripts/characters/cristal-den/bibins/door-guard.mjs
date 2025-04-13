import {Guard} from "./guard.mjs";
import {overrideBehaviour} from "../../../behaviour/override.mjs";
import {canGuardPreventInteraction} from "../../../behaviour/watchObject.mjs";
import {hasCaughtBibinAttention} from "../../../quests/cristal-den/bibins-meeting.mjs";

export class DoorGuard extends Guard {
  constructor(model) {
    super(model);
    this.model.tasks.addTask("initializeWatchers", 100, 1);
  }

  get isOfficeEntranceForbidden() {
    return !hasCaughtBibinAttention();
  }

  initializeWatchers() {
    this.initializeCellDoorWatch();
    this.initializeBibinDoorWatch();
  }

  initializeCellDoorWatch() {
    const door = level.findObject("hostel.cell-room.door");
    overrideBehaviour(door.script, "onUse", this.onCellDoorOpening.bind(this));
    overrideBehaviour(door.script, "onUseLockpick", this.onCellDoorOpening.bind(this));
  }

  initializeBibinDoorWatch() {
    const door = level.findObject("hostel.bibins-room.door");
    overrideBehaviour(door.script, "onUse", this.onBibinDoorOpening.bind(this));
    overrideBehaviour(door.script, "onUseLockpick", this.onBibinDoorOpening.bind(this));
  }

  onCellDoorOpening(user) {
    if (canGuardPreventInteraction(this.model, user)) {
      level.addTextBubble(this.model, i18n.t("cristal-den-slum-bubbles.bibin-bodyguard.cell-door-forbidden"), 3500, "orange");
      return true;
    }
    return false;
  }

  onBibinDoorOpening(user) {
    if (this.isOfficeEntranceForbidden && canGuardPreventInteraction(this.model, user)) {
      level.addTextBubble(this.model, i18n.t("cristal-den-slum-bubbles.bibin-bodyguard.office-door-forbidden"), 3500, "orange");
      return true;
    }
    return false;
  }
}
