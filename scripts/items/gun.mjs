import {Weapon} from "./weapon.mjs";

export class Gun extends Weapon {
  constructor(model) {
    super(model);
    this.useModes = ["shoot", "reload"];
    this.skill = "smallGuns";
    this.model.maxAmmo = 1;
    this.ammoType = "9mm-ammo";
  }

  get triggersCombat() {
    return this.model.useMode == "shoot";
  }
  
  get requiresTarget() {
    return this.model.useMode == "shoot";
  }

  get availableAmmo() {
    return this.user.inventory.count(this.ammoType);
  }
  
  getActionPointCost() {
    if (this.model.useMode == "shoot")
      return 5;
    return 2;
  }

  getAnimationSteps(target) {
    return [
      { type: "Animation", animation: "use", object: this.user },
      { type: "Sound", sound: this.fireAnimationSound, object: this.user },
      this.newShotAnimation(this.user, target)
    ]
  }

  onReloaded() {
    const availableAmmo = this.availableAmmo;

    if (availableAmmo > 0) {
      const requiredAmmo = this.model.maxAmmo - this.model.ammo;
      const amount = Math.min(requiredAmmo, availableAmmo);
      
      this.user.inventory.removeItemOfType(this.ammoType, amount);
      this.model.ammo += amount;
      this.model.useMode = "shoot";
      game.sounds.play("reload");
      return true;
    }
    else {
      game.appendToConsole(i18n.t("messages.out-of-ammo", { item: this.model.displayName }));
      this.user.actionPoints += this.getActionPointCost();
      game.sounds.play("out-of-ammo");
    }
    return false;
  }

  onUnloaded() {
    const amount = this.model.ammo;

    if (amount > 0) {
      this.model.ammo = 0;
      this.user.inventory.addItemOfType(this.ammoType, amount);
      game.sounds.play("reload");
    }
    else
      game.sounds.play("out-of-ammo");
  }

  onOutOfAmmo() {
    if (this.user == game.player)
      game.appendToConsole(i18n.t("Out of ammo !"));
    this.user.actionPoints += this.getActionPointCost();
    game.sounds.play("out-of-ammo");
  }

  triggerUseOn(target) {
    console.log("Trigger uze on trez cher", this.model.useMode);
    if (this.model.useMode == "reload")
      return { steps: [], callback: this.onReloaded.bind(this) };
    else if (this.model.useMode == "unload")
      return { steps: [], callback: this.onUnloaded.bind(this) };
    if (this.model.ammo > 0) {
      this.model.ammo -= 1;
      return super.triggerUseOn(target);
    }
    else
      this.onOutOfAmmo();
    return false;
  }

  triggerDodgeUse(target) {
    return {
      steps: this.getAnimationSteps(target),
      callback: this.onDodged.bind(this, target)
    };
  }
};

export function create(model) {
  return new Handgun(model);
}
