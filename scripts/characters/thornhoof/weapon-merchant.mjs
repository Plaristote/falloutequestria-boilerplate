import {ShopOwner} from "./../shop-owner.mjs";
import {RoutineComponent} from "../../behaviour/routine.mjs";

export default class extends ShopOwner {
  constructor(model) {
    super(model);
    this.routine = new RoutineComponent(this, [
      { hour: "7", minute: "0", callback: "goToWork" },
      { hour: "22", minute: "1", callback: "goToSleep" }
    ]);
  }

  get dialog() {
    return "thornhoof/weapon-merchant";
  }

  get shopShelfs() {
    return this.shop.findGroup("shelfs").objects;
  }

  get appartment() {
    return level.findGroup("marketplace.floor.appartment#2");
  }

  get bed() {
    return this.appartment.findObject("bed");
  }
}
