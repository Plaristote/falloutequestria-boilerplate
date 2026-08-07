import {Rifle} from "./rifle.mjs";
import {isBursting, triggerBurstUseOn} from "./burst.mjs";

export default class AssaultRifle extends Rifle {
  constructor(model) {
    super(model);
    this.skill = "smallGuns";
    this.model.maxAmmo = 30;
    this.ammoType = "5.56-ammo";
    this.useModes = ["shoot", "burst", "reload"];
  }

  isBursting() {
    return isBursting(this);
  }

  get fireAnimationSound() {
    if (this.model.useMode == "burst")
      return "gunshot-burst";
    return "gunshot";
  }

  get triggersCombat() {
    return this.model.useMode == "shoot" || this.isBursting();
  }

  get requiresTarget() {
    return this.model.useMode == "shoot" || this.isBursting();
  }

  getDamageType() {
    return "piercing";
  }

  getSingleShotDamageRange() {
    return [8, 16];
  }

  getDamageRange() {
    const [min, max] = this.getSingleShotDamageRange();

    if (this.isBursting())
      return [Math.round(min * 1.6), Math.round(max * 1.6)];
    return [min, max];
  }

  getRange() {
    return 12;
  }

  getBurstAmmoCost() {
    return 3;
  }

  getSingleShotActionPointCost() {
    return 5;
  }

  getActionPointCost() {
    if (this.isBursting())
      return this.getSingleShotActionPointCost() + 1;
    if (this.model.useMode == "shoot")
      return this.getSingleShotActionPointCost();
    return 2;
  }

  triggerUseOn(target) {
    if (this.isBursting()) {
      if (this.model.ammo <= 0) {
        this.onOutOfAmmo();
        return false;
      }
      this.model.ammo -= Math.min(this.getBurstAmmoCost(), this.model.ammo);
      return triggerBurstUseOn(this, target);
    }
    return super.triggerUseOn(target);
  }
}
