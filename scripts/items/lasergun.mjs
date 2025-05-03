import {Gun} from "./gun.mjs";

class LaserGun extends Gun {
  constructor(model) {
    super(model);
    this.skill = "energyGuns";
    this.model.maxAmmo = 10;
    this.ammoType = "energy-cell";
    this.fireAnimationSound = "energy-shot";
  }

  getDamageType() {
    return "energy";
  }

  getDamageRange() {
    return [22,33];
  }

  getRange() {
    return 12;
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

export function create(model) {
  return new LaserGun(model);
}
