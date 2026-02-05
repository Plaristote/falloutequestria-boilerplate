import Armor from "./armor.mjs";

const mitigation = {
  "blunt": 0.4,
  "energy": 0.2,
  "explosion": 0.2,
  "piercing": 0.1
};

export default class extends Armor {
  constructor(model) {
    super(model);
    this.armorClass = 7;
    this.mitigationData = mitigation;
  }
}
