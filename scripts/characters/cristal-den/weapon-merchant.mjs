import {ShopOwner} from "./../shop-owner.mjs";
import {overrideBehaviour} from "../../behaviour/override.mjs";

export class WeaponMerchant extends ShopOwner {
  constructor(model) {
    super(model);
    this.model.tasks.addTask("initializeBackdoorWatch", 100, 1);
  }

  get dialog() {
    return "cristal-den/weapon-merchant";
  }

  get bed() {
    return this.shop.findObject("bedroom.bed");
  }

  get shopShelfs() {
    return this.shop.findGroup("backroom").find(candidate => {
      return candidate.objectName.startsWith("shelf");
    });
  }

  initializeBackdoorWatch() {
    const door = this.shop.findObject("door#3");
    overrideBehaviour(door.script, "onUse", this.onBackdoorOpening.bind(this));
    overrideBehaviour(door.script, "onUseLockpick", this.onBackdoorOpening.bind(this));
  }

  onBackdoorOpening(user) {
    return !this.shop.script.onShopliftAttempt(user);
  }
}
