import ArmorBehaviour from "./armor.mjs";

class Armor extends ArmorBehaviour  {
  constructor(model) {
    super(model);
    this.armorClass = 15;
  }
}

export function create(model) {
  return new Armor(model);
}
