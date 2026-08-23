import DrugBuff from "../helpers/drug.mjs";

export default class extends DrugBuff {
  get storageScope() {
    return "medx-modifier-";
  }

  get delay() {
    return 240 * 1000;
  }

  get withdrawalDuration() {
    return 1 * 24 * 60 * 60 * 1000;
  }

  get modifierDefinitions() {
    return [
      {statisticName: "damageResistance", positive: true, base: 25, limit: 40}
    ];
  }
}
