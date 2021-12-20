import {CharacterBehaviour} from "../character.mjs";
import {overrideBehaviour} from "../../behaviour/override.mjs";
import {RoutineComponent} from "../../behaviour/routine.mjs";

const routine = [
  { hour: "8", minute: "0",  callback: "goToWork"  },
  { hour: "3", minute: "15", callback: "goToSleep" }
];

class CasinoBarpony extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.routineComponent =  new RoutineComponent(this, routine);
  }

  initialize() {
    this.routineComponent.enablePersistentRoutine();
  }

  get dialog() {
    if (this.routineComponent.getCurrentRoutine().callback === "goToWork")
      return "town-barpony";
    return null;
  }

  get bed() {
    return level.findObject("casino.rooms.dormitory.bed-barpony");
  }

  goToWork() {
    this.model.actionQueue.pushMovement(36, 11, 0);
    this.model.actionQueue.start();
  }

  goToSleep() {
    this.model.actionQueue.pushReach(this.bed, 1);
    this.model.actionQueue.start();
  }

  onObservationTriggered() {
    if (!level.combat && this.model.fieldOfView.isDetected(game.player)) {
      const barZone = level.findObject("casino.game-room.bar-storage").controlZone;
      const isInZone = game.player.isInZone(barZone);

      if (isInZone) {
        level.addTextBubble(this.model, i18n.t("bubbles.chase-from-bar"), 4000, "yellow");
        level.moveCharacterToZone(level.player, level.findGroup("casino.entry").controlZone);
      }
    }
  }
}

export function create(model) {
  return new CasinoBarpony(model);
}
