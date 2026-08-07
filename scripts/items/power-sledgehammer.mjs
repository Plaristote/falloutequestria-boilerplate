import Sledgehammer from "./sledgehammer.mjs";
import {Gun} from "./gun.mjs";

export default class PowerSledgehammer extends Sledgehammer {
  constructor(model) {
    super(model);
    this.model.maxAmmo = 10;
    this.ammoType = "energy-cell";
    this.useModes = ["hit", "swing", "reload"];
  }

  get availableAmmo() {
    return this.user.inventory.count(this.ammoType);
  }

  // a shitload more damage than the standard sledgehammer
  getDamageRange() {
    return [25, 45];
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

  // "hit" mode now needs a charge of ammo
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

  // "swing" mode also needs a charge of ammo
  attemptToUseAt(x, y) {
    if (this.model.ammo <= 0) {
      this.onOutOfAmmo();
      return false;
    }
    this.model.ammo -= 1;
    return super.attemptToUseAt(x, y);
  }
}
