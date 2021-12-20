import {ArmorBehaviour} from "./armor.mjs";

class PowerArmor extends ArmorBehaviour  {
  constructor(model) {
    super(model);
    this.armorClass = 25;
  }
  
  onEquipped(user, on) {
    if (on)
      user.statistics.strength += 2;
    else
      user.statistics.strength -= 2;
    this.onEquipped(user, on);
  }
}

export function create(model) {
  return new PowerArmor(model);
}
