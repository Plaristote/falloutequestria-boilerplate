import DrugBuff from "../helpers/drug.mjs";

export default class extends DrugBuff {
  get storageScope() {
    return "mintals-modifier-";
  }

  get delay() {
    return 300 * 1000;
  }

  updateModifiers() {
    this.updateModifier("intelligence", true, 1, 3);
    this.updateModifier("science", true, 10, 35);
    this.updateModifier("repair", true, 10, 35);
  }
}
