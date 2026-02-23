import {MeleeAttack} from "./melee.mjs";

export class ShadowBlade extends MeleeAttack {
  constructor(model) {
    super(model);
    this.hitSound = "weapons/knife";
  }

  getTargetArmorClass(target) {
    const buff = target.getBuff("frost-armor");
    const armorClass = super.getTargetArmorClass(target);
    return armorClass + (buff ? 20 : 0);
  }

  getDamageType() {
    return "dark-magic";
  }

  getDamageRange() {
    const baseDamage = this.getDamageBase();
    return [baseDamage, baseDamage];
  }
}
