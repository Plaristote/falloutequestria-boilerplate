import {Armor} from "./armor.mjs";

const mitigation = {
  "blunt": 0.3,
  "energy": 0.1,
  "explosion": 0.1,
  "piercing": 0.15
};

export default class extends Armor {
  constructor(model) {
    super(model);
    this.armorClass = 8;
    this.mitigationData = mitigation;
  }
}
