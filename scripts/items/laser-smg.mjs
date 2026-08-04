import {Gun} from "./gun.mjs";
import {isBursting, triggerBurstUseOn} from "./burst.mjs";

export default class LaserSmg extends Gun {
  constructor(model) {
    super(model);
    this.skill = "energyGuns";
    this.model.maxAmmo = 20;
    this.ammoType = "energy-cell";
    this.useModes = ["shoot", "burst", "reload"];
  }

  isBursting() {
    return isBursting(this);
  }

  get fireAnimationSound() {
    return this.isBursting() ? "energy-shot-rapid" : "energy-shot";
  }

  get triggersCombat() {
    return this.model.useMode == "shoot" || this.isBursting();
  }

  get requiresTarget() {
    return this.model.useMode == "shoot" || this.isBursting();
  }

  getDamageType() {
    return "energy";
  }

  getSingleShotDamageRange() {
    return [16, 24];
  }

  getDamageRange() {
    const [min, max] = this.getSingleShotDamageRange();

    if (this.isBursting())
      return [Math.round(min * 1.5), Math.round(max * 1.5)];
    return [min, max];
  }

  getRange() {
    return 10;
  }

  getBurstAmmoCost() {
    return 3;
  }

  getSingleShotActionPointCost() {
    return 4;
  }

  getActionPointCost() {
    switch (this.model.useMode) {
    case "shoot":
      return this.getSingleShotActionPointCost();
    case "burst":
      return this.getSingleShotActionPointCost() + 1;
    }
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

  newShotAnimation(user, target) {
    const shotWidth = 95;
    const margin = 15;
    var   anchorX = user.spritePosition.x;
    var   anchorY = user.spritePosition.y;

    user.lookAt(target);
    switch (user.orientation) {
    case "left":
      anchorX = anchorX - shotWidth + margin;
      anchorY = anchorY + user.clippedRect.height / 2 - 45;
      break ;
    case "right":
      anchorX = anchorX + user.clippedRect.width - margin;
      anchorY = anchorY + user.clippedRect.height / 2 - 45;
      break ;
    }
    return [
      {
        type: "Sprite",
        name: "effects",
        animation: "bullet",
        speed: 800,
        fromX: user.spritePosition.x,
        fromY: user.spritePosition.y,
        toX: target.spritePosition.x,
        toY: target.spritePosition.y
      }
    ];
  }
}
