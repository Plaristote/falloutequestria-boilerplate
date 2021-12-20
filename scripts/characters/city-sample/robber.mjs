import {CharacterBehaviour} from "../character.mjs";
import {RoutineComponent} from "../../behaviour/routine.mjs";
import {textBubbles} from "../passerby.mjs";
import {getValueFromRange} from "../../behaviour/random.mjs";

const routine = [
  { hour: "20", minute: "45", name: "robbing" },
  { hour: "2",  minute: "50", name: "waiting" }
];

class Robber extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.routineComponent = new RoutineComponent(this, routine);
    this.textBubbles = textBubbles;
  }

  initialize() {
    this.model.tasks.addTask("triggerRobAction",   24321, 0);
    this.model.tasks.addTask("triggerHotelAction",  6250, 0);
  }

  get currentRoutine() {
    return this.routineComponent.getCurrentRoutine().name;
  }

  get dialog() {
    if (this.currentRoutine == "robbing" || this.model.getVariable("escaping"))
      return "town-robber";
    return null;
  }

  onObservationTriggered() {
    if (this.model.getVariable("escaping") && !level.combat) {
      if (this.model.fieldOfView.isDetected(level.player))
        level.initializeDialog(this.model);
    }
  }

  onLook() {
    if (this.currentRoutine == "robbing" && this.model.isAlive() && !level.combat) {
      game.appendToConsole(
        i18n.t("inspection.character-male", {target: this.model.statistics.name})
        + " " + i18n.t("sample-city.shady-robber")
      );
      return true;
    }
    return super.onLook();
  }

  triggerHotelAction() {
    console.log("Robber: triggerHotelAction", this.currentRoutine);
    if (this.currentRoutine == "waiting" && !this.routineComponent.interrupted) {
      const bed = level.findObject("casino.rooms.room-1.bed");

      if (this.model.getDistance(bed) > 3) {
        this.model.actionQueue.pushReach(bed);
        this.model.actionQueue.start();
      }
    }
  }
  
  triggerRobAction() {
    if (this.currentRoutine == "robbing" && !this.routineComponent.interrupted && this.model.actionQueue.isEmpty()) {
      const victims = this.getRobberVictims();

      if (victims.length > 0) {
        const roll = getValueFromRange(0, victims.length - 1);
        const victim = victims[roll];

        this.model.actionQueue.pushReach(victim);
        this.model.actionQueue.pushInteraction(victim, "use");
        if (this.model.actionQueue.start())
          console.log("ROBBER going stealing");
        else
          console.log("ROBBER failed to go steal", victim);
      }
    }
  }

  getRobberVictims() {
    const gameRoom = level.findGroup("casino.game-room");
    const results = [];

    for (var i = 0 ; i < gameRoom.objects.length ; ++i) {
      const object = gameRoom.objects[i];

      console.log("candidate victim", object);
      if (object.objectName.startsWith("customer"))
        results.push(object);
    }
    return results;
  }
}

export function create(model) {
  return new Robber(model);
}
