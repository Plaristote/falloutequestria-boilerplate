import DrugBuff from "../helpers/drug.mjs";

export default class extends DrugBuff {
  get storageScope() {
    return "dash-modifier-";
  }

  get delay() {
    return 120 * 1000;
  }

  updateModifiers() {
    this.updateModifier("armorClass", true, 10, 30);
    this.updateModifier("actionPoints", true, 2, 3);
  }
}
