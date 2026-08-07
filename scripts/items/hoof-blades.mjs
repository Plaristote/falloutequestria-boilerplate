import WeaponBehaviour from "./melee.mjs";

export default class HoofBlades extends WeaponBehaviour {
  constructor(model) {
    super(model);
    this.hitSound = "weapons/knife";
    this.skill = "unarmed";
  }

  getActionPointCost() {
    return 3;
  }

  getDamageType() {
    return "slash";
  }

  getDamageRange() {
    const base = this.getDamageBase();
    return [base + 2, base + 8];
  }

  getAnimationSteps(target) {
    return [{ type: "Animation", animation: "melee", object: this.user }];
  }

  getUseAnimation(target) {
    return this.getAnimationSteps(target);
  }
}
