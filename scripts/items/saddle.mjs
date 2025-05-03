import {ItemBehaviour} from "./item.mjs";

export default class SaddleBehaviour extends ItemBehaviour {
  constructor(model) {
    super(model);
    this.triggersCombat = false;
    this.carryWeightBonus = 0;
  }

  canEquipInSlotType(slotType) {
    return slotType == "saddle";
  }

  onEquipped(user, on) {
    if (on)
      user.statistics.carryWeight += this.carryWeightBonus;
    else
      user.statistics.carryWeight -= this.carryWeightBonus;
  }

  getDescription() {
    return i18n.t("item-descriptions." + this.model.itemType)
         + "<br><br>"
         + this.carryWeightBonus ? (i18n.t("cmap.carryWeight") + ": " + this.model.carryWeightBonus) : "";
  }

  get spriteSheet() {
    return "saddle";
  }
}
