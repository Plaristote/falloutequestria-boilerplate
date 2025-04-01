import {MeleeAttack} from "./melee.mjs";

export class ShadowBlade extends MeleeAttack {
  constructor(model) {
    super(model);
    this.hitSound = "weapons/knife";
  }

  getDamageType() {
    return "dark-magic";
  }

  getDamageRange() {
    const baseDamage = this.getDamageBase();
    return [baseDamage, baseDamage];
  }
}
