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
    if (this.model.useMode == "shoot" || this.model.userMode == "burst") {
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
    const shootAnimation = { type: "Animation", animation: animation, object: this.user }
    let list = [
      { type: "Sound", sound: this.fireAnimationSound, object: this.user },
      shootAnimation
    ];

    if (this.model.useMode == "burst") {
      list.push(shootAnimation);
      list.push(shootAnimation);
    }
    return list;
  }

  canEquipInSlotType(slotType) {
    if (slotType == "any")
    {
      const saddle = this.user.inventory.getEquippedItem("saddle");
      return saddle != null || this.user.statistics.race === "unicorn";
    }
    return false;
  }
};
