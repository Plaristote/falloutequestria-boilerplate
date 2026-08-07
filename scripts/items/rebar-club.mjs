import {WeaponBehaviour} from "./weapon.mjs";

export default class RebarClub extends WeaponBehaviour {
  constructor(model) {
    super(model);
    this.hitSound = "weapons/club";
    this.skill = "meleeWeapons";
  }

  getActionPointCost() {
    return 3;
  }

  getDamageType() {
    return "blunt";
  }

  getDamageRange() {
    return [5, 12];
  }

  getAnimationSteps(target) {
    return [{ type: "Animation", animation: "melee", object: this.user }];
  }

  getUseAnimation(target) {
    return this.getAnimationSteps(target);
  }
}
