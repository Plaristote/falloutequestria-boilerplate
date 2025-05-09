import Armor from "./armor.mjs";

const mitigation = {
  "blunt": 0.5,
  "energy": -0.1,
  "explosion": 0.2,
  "piercing": 0.3
};

export default class extends Armor {
  constructor(model) {
    super(model);
    this.armorClass = 10;
    this.mitigationData = mitigation;
  }
}
