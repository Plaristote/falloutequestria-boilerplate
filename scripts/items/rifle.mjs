import {Gun} from "./gun.mjs";

export default class Rifle extends Gun {
  constructor(model) {
    super(model);
    this.ammoType = "9mm-ammo";
  }

  getActionPointCost() {
    if (this.model.useMode == "shoot")
      return 5;
    return 2;
  }

  getSpriteSheetLayers(useSlotId) {
    return [`rifle-${useSlotId}-back`, `rifle-${useSlotId}-front`];
  }

  getWeaponAnimationSteps() {
    if (this.model.useMode == "shoot") {
      switch (this.user.inventory.getEquippedItemSlot(this.model)) {
      case "use-1":
        return "shoot-1";
      case "use-2":
        return "shoot-2";
      }
    }
    return "use";
  }

  getAnimationSteps(target) {
    const animation = this.getWeaponAnimationSteps();
    return [
      { type: "Sound", sound: this.fireAnimationSound, object: this.user },
      { type: "Animation", animation: animation, object: this.user },
    ];
  }

  canEquipInSlotType(slotType) {
    const saddle = this.user.inventory.getEquippedItem("saddle");
    return saddle != null || this.user.statistics.race === "unicorn";
  }
};
