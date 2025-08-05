import DrugBuff from "../helpers/drug.mjs";

export default class extends DrugBuff {
  get storageScope() {
    return "medx-modifier-";
  }

  get delay() {
    return 240 * 1000;
  }

  updateModifiers() {
    this.updateModifier("damageResistance", true, 25, 40);
  }
}
