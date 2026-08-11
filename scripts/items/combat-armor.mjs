import Armor from "./armor.mjs";

const mitigation = {
  "blunt": 0.4,
  "slash": 0.4,
  "energy": 0.3,
  "explosion": 0.3,
  "piercing": 0.5
};

export default class extends Armor {
  constructor(model) {
    super(model);
    this.armorClass = 10;
    this.mitigationData = mitigation;
  }
}
