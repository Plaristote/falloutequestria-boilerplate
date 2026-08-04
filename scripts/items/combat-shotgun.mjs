import {Rifle} from "./rifle.mjs";

export default class CombatShotgun extends Rifle {
  constructor(model) {
    super(model);
    this.model.maxAmmo = 6;
    this.ammoType = "shotgun-shell";
    this.fireAnimationSound = "gunshot";
  }

  getDamageType() {
    return "piercing";
  }

  getDamageRange() {
    return [16, 32];
  }

  getRange() {
    return 8;
  }
}
