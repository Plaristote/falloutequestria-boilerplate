import Saddle from "./saddle.mjs";

const armorClassBonus = 5;
const bigGunsBonus = 10;

export default class extends Saddle {
  constructor(model) {
    super(model);
    this.carryWeightBonus = 50;
  }

  canEquipInSlotType(slotType) {
    return slotType == "saddle";
  }

  onEquipped(user, on) {
    if (on) {
      user.statistics.armorClass += armorClassBonus;
      user.statistics.bigGuns += bigGunsBonus;
    } else {
      user.statistics.armorClass -= armorClassBonus;
      user.statistics.bigGuns += bigGunsBonus;
    }
  }

  getDescription() {
    return super.getDescription() +
         + "<br>"
         + i18n.t("cmap.armorClass") + `: +${armorClassBonus}` + "<br>"
         + i18n.t("cmap.bigGuns") + `: +${bigGunsBonus}`;
  }
}
