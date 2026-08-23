import DrugBuff from "../helpers/drug.mjs";

export default class extends DrugBuff {
  get addictionGroup() {
    return "mintals";
  }

  get storageScope() {
    return "partytime-mintals-modifier-";
  }

  get delay() {
    return 300 * 1000;
  }

  get withdrawalDuration() {
    return 2 * 24 * 60 * 60 * 1000;
  }

  updateModifiers() {
    return [
      {statisticName: "intelligence", positive: true, base: 2, limit: 4},
      {statisticName: "science", positive: true, base: 25, limit: 60},
      {statisticName: "repair", positive: true, base: 25, limit: 60},
      {statisticName: "luck", positive: true, base: 2, limit: 5},
    ];
  }
}
