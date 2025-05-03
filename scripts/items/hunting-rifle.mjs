import {Rifle} from "./rifle.mjs";

export default class HuntingRifle extends Rifle {
  constructor(model) {
    super(model);
    this.model.maxAmmo = 10;
    this.ammoType = "223-ammo";
    this.fireAnimationSound = "gunshot";
  }

  getDamageType() {
    return "piercing";
  }

  getDamageRange() {
    return [8,20];
  }

  getRange() {
    return 16;
  }
}
