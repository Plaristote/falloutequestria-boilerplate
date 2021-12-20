import {CharacterBehaviour} from "../character.mjs";
import {RoutineComponent} from "../../behaviour/routine.mjs";
import {routine} from "../../behaviour/sample-city/casino-kitchen.mjs";

class Cook extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.routineComponent =  new RoutineComponent(this, routine);
  }

  initialize() {
    this.model.setVariable("workX", this.model.position.x);
    this.model.setVariable("workY", this.model.position.y);
    this.routineComponent.enablePersistentRoutine();
  }

  get workPosition() {
    return [this.model.getVariable("workX"), this.model.getVariable("workY"), 0];
  }

  get bed() {
    return level.findObject("casino.rooms.dormitory.bed-cook");
  }

  goToWork() {
    this.model.actionQueue.pushMovement(...this.workPosition);
    this.model.actionQueue.start();
  }

  goToSleep() {
    this.model.actionQueue.pushReach(this.bed, 1);
    this.model.actionQueue.start();
  }

  onObservationTriggered() {
    if (!level.combat && this.model.fieldOfView.isDetected(game.player)) {
      const isInZone = game.player.isInZone(level.findGroup("casino.kitchen").controlZone);

      if (isInZone) {
        level.addTextBubble(this.model, i18n.t("bubbles.chase-from-kitchen"), 4000, "yellow");
        level.moveCharacterToZone(level.player, level.findGroup("casino.restaurant").controlZone);
      }
    }
  }
}

export function create(model) {
  return new Cook(model);
}
