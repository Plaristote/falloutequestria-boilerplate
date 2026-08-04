import {Rifle} from "./rifle.mjs";

export default class LaserRifle extends Rifle {
  constructor(model) {
    super(model);
    this.skill = "energyGuns";
    this.model.maxAmmo = 12;
    this.ammoType = "energy-cell";
    this.fireAnimationSound = "energy-shot";
  }

  getDamageType() {
    return "energy";
  }

  getDamageRange() {
    return [25, 45];
  }

  getRange() {
    return 14;
  }

  getSpriteSheetLayers(useSlotId) {
    return [`plasma-rifle-${useSlotId}-back`, `plasma-rifle-${useSlotId}-front`];
  }
}
