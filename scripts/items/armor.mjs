import {ItemBehaviour} from "./item.mjs";

export default class ArmorBehaviour extends ItemBehaviour {
  constructor(model) {
    super(model);
    this.triggersCombat = false;
    this.armorClass = 0;
  }
  
  canEquipInSlotType(slotType) {
    return slotType == "armor";
  }

  onEquipped(user, on) {
    if (on)
      user.statistics.armorClass += this.armorClass;
    else
      user.statistics.armorClass -= this.armorClass;
  }

  mitigateDamage(damage, damageType) {
    if (this.mitigationData) {
      const value = this.mitigationData[damageType];

      if (value)
        return damage - Math.round(damage * value);
    }
    return damage;
  }

  getDescription() {
    return i18n.t("item-descriptions." + this.model.itemType)
      + "<br><br>"
      + (this.mitigationData ? this.mitigationTable() : null);
  }

  mitigationTable() {
    let html = "<table>";

    html += `<tr><th>${i18n.t("damageType")}</th><th>${i18n.t("resistance")}</th></tr>`;
    for (let damageType in this.mitigationData) {
      const value = this.mitigationData[damageType];
      html += `<tr><th>${i18n.t("damageTypes." + damageType)}</th>`
      html += `<td>${Math.round(value * 100)}%</td></tr>`;
    }
    return html + "</table>";
  }
}

export const Armor = ArmorBehaviour;
