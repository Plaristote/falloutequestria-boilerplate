import Saddle from "./saddle.mjs";

export default class extends Saddle {
  constructor(model) {
    super(model);
    this.carryWeightBonus = 15;
  }
}
