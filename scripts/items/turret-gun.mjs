import {WeaponBehaviour} from "./weapon.mjs";

class TurretGun extends WeaponBehaviour {
  constructor(model) {
    super(model);
    this.skill = "smallGuns";
    this.fireAnimationSound = "gunshot";
  }

  getDamageType() {
    return "piercing";
  }

  getActionPointCost() {
    return 5;
  }

  getDamageRange() {
    return [12,30];
  }

  getRange() {
    return 20;
  }

  getAnimationSteps(target) {
    return [
      { type: "Animation", animation: "fire", object: this.user },
      { type: "Sound", sound: this.fireAnimationSound, object: this.user }
    ]
  }
}

export function create(model) {
  return new TurretGun(model);
}
