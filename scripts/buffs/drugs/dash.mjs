import DrugBuff from "../helpers/drug.mjs";

export default class extends DrugBuff {
  get storageScope() {
    return "dash-modifier-";
  }

  get delay() {
    return 120 * 1000;
  }

  get withdrawalDuration() {
    return 3 * 24 * 60 * 60 * 1000;
  }

  get modifierDefinitions() {
    return [
      {statisticName: "armorClass", positive: true, base: 10, limit: 30},
      {statisticName: "actionPoints", positive: true, base: 2, limit: 3},
    ];
  }
}
