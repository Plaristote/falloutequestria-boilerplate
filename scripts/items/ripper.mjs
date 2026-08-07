import {WeaponBehaviour} from "./weapon.mjs";
import {Gun} from "./gun.mjs";

export default class Ripper extends WeaponBehaviour {
  constructor(model) {
    super(model);
    this.hitSound = "weapons/ripper";
    this.skill = "meleeWeapons";
    this.model.maxAmmo = 20;
    this.ammoType = "energy-cell";
    this.useModes = ["hit", "reload"];
  }

  get availableAmmo() {
    return this.user.inventory.count(this.ammoType);
  }

  get requiresTarget() {
    return this.model.useMode == "hit";
  }

  // as fast as a combat knife
  getActionPointCost() {
    return 3;
  }

  getDamageType() {
    return "slash";
  }

  // significantly more than the combat knife's [3, 10]
  getDamageRange() {
    return [12, 24];
  }

  getAnimationSteps(target) {
    return [
      { type: "Sound", sound: "weapons/ripper-motor", object: this.user },
      { type: "Animation", animation: "slash", object: this.user }
    ];
  }

  getUseAnimation(target) {
    return this.getAnimationSteps(target);
  }

  onReloaded() {
    return Gun.prototype.onReloaded.call(this);
  }

  onUnloaded() {
    return Gun.prototype.onUnloaded.call(this);
  }

  onOutOfAmmo() {
    return Gun.prototype.onOutOfAmmo.call(this);
  }

  triggerUseOn(target) {
    if (this.model.useMode == "reload")
      return { steps: [], callback: this.onReloaded.bind(this) };
    else if (this.model.useMode == "unload")
      return { steps: [], callback: this.onUnloaded.bind(this) };
    if (this.model.ammo > 0) {
      this.model.ammo -= 1;
      return super.triggerUseOn(target);
    }
    this.onOutOfAmmo();
    return false;
  }
}
