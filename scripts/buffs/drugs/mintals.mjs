import DrugBuff from "../helpers/drug.mjs";

export default class extends DrugBuff {
  get addictionGroup() {
    return "mintals";
  }

  get storageScope() {
    return "mintals-modifier-";
  }

  get delay() {
    return 300 * 1000;
  }

  get withdrawalDuration() {
    return 2 * 24 * 60 * 60 * 1000;
  }

  get modifierDefinitions() {
    return [
      {statisticName: "intelligence", positive: true, base: 1, limit: 3},
      {statisticName: "science", positive: true, base: 10, limit: 35},
      {statisticName: "repair", positive: true, base: 10, limit: 35},
    ];
  }
}
