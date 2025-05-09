import ArmorBehaviour from "./armor.mjs";

const mitigation = {
  "blunt": 0.6,
  "energy": 0.4,
  "explosion": 0.6,
  "piercing": 0.5
};

export default class PowerArmor extends ArmorBehaviour  {
  constructor(model) {
    super(model);
    this.armorClass = 25;
    this.mitigationData = mitigation;
  }
  
  onEquipped(user, on) {
    if (on)
      user.statistics.strength += 2;
    else
      user.statistics.strength -= 2;
    super.onEquipped(user, on);
  }
}
