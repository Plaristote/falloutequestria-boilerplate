import {CharacterBehaviour} from "../character.mjs";
import {RoutineComponent} from "../../behaviour/routine.mjs";

const routine = [
  { hour: "10", minute: "0", callback: "goToDrink" },
  { hour: "2",  minute: "0", callback: "goToSleep" }
];

export class DrunkenMaster extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.routineComponent = new RoutineComponent(this, routine);
    this.routineComponent.interrupted = !this.isHealed;
  }

  get isHealed() {
    return this.model.hasVariable("healed");
  }

  get dialog() {
    if (this.isHealed && this.routineComponent.getCurrentRoutine().callback == "goToDrink")
      return "hillburrow/drunken-master";
    return null;
  }

  initialize() {
    this.model.fallUnconscious();
    this.routineComponent.enablePersistentRoutine();
  }

  onLook() {
    if (!this.isHealed) {
      game.appendToConsole(i18n.t("quests.save-drunken-master.inspect-drunken-master"));
      return true;
    }
    return false;
  }

  onHealed() {
    this.model.setVariable("healed", 1);
    this.routineComponent.interrupted = false;
    this.routineComponent.updateRoutine();
  }

  goToDrink() {
    this.model.actionQueue.pushMovement(36, 44);
    this.model.actionQueue.start();
  }

  goToSleep() {
    this.model.actionQueue.pushMovement(17, 46);
    this.model.actionQueue.start();
  }
}
