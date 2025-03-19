import {WeaponBehaviour} from "./weapon.mjs";

export class CombatKnife extends WeaponBehaviour {
  constructor(model) {
    super(model);
    this.hitSound = "weapons/knife";
    this.skill = "meleeWeapons";
  }

  getActionPointCost() {
    return 3;
  }

  getDamageType() {
    return "slash";
  }

  getDamageRange() {
    return [3, 10];
  }

  getAnimationSteps(target) {
    return [{ type: "Animation", animation: "slash", object: this.user }];
  }

  getUseAnimation() {
    return this.getAnimationSteps(target);
  }
}
