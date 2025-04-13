import {ShopOwner} from "../shop-owner.mjs";
import {overrideBehaviour} from "../../behaviour/override.mjs";
import {RoutineComponent} from "../../behaviour/routine.mjs";
import {routine, initializeRoutineUser} from "./resident-routine.mjs";

export class Intendant extends ShopOwner {
  constructor(model) {
    super(model);
    this.dialog = "junkville/intendant";
    this.routineComponent = new RoutineComponent(this, routine);
    this.model.tasks.addTask("initializeBackdoorWatch", 100, 1);
  }

  initialize() {
    initializeRoutineUser(this.model);
  }

  get bed() {
    return this.shop.findObject("bed");
  }

  get shopShelfs() {
    return [this.shop.findObject("shelf")];
  }

  initializeBackdoorWatch() {
    const door = this.shop.findObject("door-backroom");
    overrideBehaviour(door.script, "onUse", this.onBackdoorOpening.bind(this));
    overrideBehaviour(door.script, "onUseLockpick", this.onBackdoorOpening.bind(this));
  }

  onBackdoorOpening(user) {
    return !this.shop.script.onShopliftAttempt(user);
  }
}
