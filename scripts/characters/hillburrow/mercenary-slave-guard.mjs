import {CharacterBehaviour} from "../character.mjs";
import {RoutineComponent} from "../../behaviour/routine.mjs";
import {routine} from "./slave-routine.mjs";
import {MercenaryRiotComponent} from "./mercenary-riot-component.mjs";

const textBubbles = [
  {content: i18n.t("bubbles.hillburrow.slave-guard-1"), duration: 2200 },
  {content: i18n.t("bubbles.hillburrow.slave-guard-2"), duration: 5000 },
  {content: i18n.t("bubbles.hillburrow.slave-guard-3"), duration: 2100 },
];

class MercenarySlaveGuard extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.routineComponent = new RoutineComponent(this, routine);
    this.riotComponent = new MercenaryRiotComponent(this);
    this.textBubbles = textBubbles;
  }

  initialize() {
    this.model.setVariable("guardX", this.model.position.x);
    this.model.setVariable("guardY", this.model.position.y);
    this.model.tasks.addUniqueTask("runRoutine", Math.random() * 5000 + 5000, 0);
  }

  runRoutine() {
    switch (this.routineComponent.getCurrentRoutine().callback) {
      case "dayShift":   return !this.isBusy && this.goToDayStation();
      case "nightShift": return !this.isBusy && this.goToNightStation();
    }
  }

  goToDayStation() {
    this.model.actionQueue.pushMovement(this.model.getVariable("guardX"), this.model.getVariable("guardY"), 0);
    this.model.actionQueue.start();
  }

  goToNightStation() {
    const coordinates = {
      "mercenary#1": [40, 11, 0],
      "mercenary#2": [33, 15, 0]
    };

    this.model.actionQueue.pushMovement(...coordinates[this.model.objectName]);
    this.model.actionQueue.start();
  }
}

export function create(model) {
  return new MercenarySlaveGuard(model);
}
