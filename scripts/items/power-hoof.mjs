import WeaponBehaviour from "./melee.mjs";
import {Gun} from "./gun.mjs";
import {getValueFromRange} from "../behaviour/random.mjs";
import {attemptPushAway} from "./push.mjs";

export default class PowerHoof extends WeaponBehaviour {
  constructor(model) {
    super(model);
    this.hitSound = "weapons/power-hoof";
    this.skill = "unarmed";
    this.model.maxAmmo = 20;
    this.ammoType = "energy-cell";
    this.useModes = ["hit", "shove", "reload"];
  }

  get availableAmmo() {
    return this.user.inventory.count(this.ammoType);
  }

  get requiresTarget() {
    return this.model.useMode == "hit" || this.model.useMode == "shove";
  }

  getDamageRange() {
    const base = this.getDamageBase();

    if (this.model.useMode == "shove")
      return [base + 8, base + 16];
    return [base + 12, base + 24];
  }

  getAnimationSteps(target) {
    return [
      { type: "Sound", sound: "weapons/power-hoof-charge", object: this.user },
      { type: "Animation", animation: "melee", object: this.user }
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

  useOn(target) {
    if (super.useOn(target)) {
      if (this.model.useMode == "shove") {
        const pushDamage = getValueFromRange(...this.getDamageRange(), this.user);
        attemptPushAway(target, pushDamage, this.user.position, {
          resistanceReduction: 20,
          slideMultiplier: 1.5
        });
      }
      return true;
    }
    return false;
  }
}
