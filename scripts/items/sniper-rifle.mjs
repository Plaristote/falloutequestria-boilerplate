import {Rifle} from "./rifle.mjs";

export default class SniperRifle extends Rifle {
  constructor(model) {
    super(model);
    this.model.maxAmmo = 6;
    this.ammoType = "223-ammo";
    this.fireAnimationSound = "gunshot";
  }

  getActionPointCost() {
    if (this.model.useMode == "shoot")
      return 6;
    return 2;
  }

  getDamageType() {
    return "piercing";
  }

  getDamageRange() {
    return [35, 45];
  }

  getRange() {
    return 30;
  }
}
