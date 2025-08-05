import DrugBuff from "../helpers/drug.mjs";

export default class extends DrugBuff {
  get storageScope() {
    return "partytime-mintals-modifier-";
  }

  get delay() {
    return 300 * 1000;
  }

  updateModifiers() {
    this.updateModifier("intelligence", true, 2, 4);
    this.updateModifier("science", true, 25, 60);
    this.updateModifier("repair", true, 25, 60);
    this.updateModifier("luck", true, 2, 5);
  }
}
