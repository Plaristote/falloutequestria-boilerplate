import {Rifle} from "./rifle.mjs";

export default class PlasmaRifle extends Rifle {
  constructor(model) {
    super(model);
    this.skill = "energyGuns";
    this.model.maxAmmo = 10;
    this.ammoType = "energy-cell";
    this.fireAnimationSound = "energy-shot";
  }

  getDamageRange() {
    return [30,65];
  }

  getRange() {
    return 13;
  }

  getSpriteSheetLayers(useSlotId) {
    return [`plasma-rifle-${useSlotId}-back`, `plasma-rifle-${useSlotId}-front`];
  }

  getAnimationSteps(target) {
    const animation = this.getWeaponAnimationSteps();
    return [
      { type: "Sound", sound: this.fireAnimationSound, object: this.user },
      { type: "Animation", animation: animation, object: this.user },
      {
        type: "Sprite",
        name: "effects",
        animation: "plasma-ball",
        speed: 500,
        fromX: this.user.spritePosition.x,
        fromY: this.user.spritePosition.y,
        toX: target.spritePosition.x,
        toY: target.spritePosition.y
      }
    ];
  }
}
