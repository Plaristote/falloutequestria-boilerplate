import {ItemBehaviour} from "./item.mjs";

export default class extends ItemBehaviour {
  constructor(model) {
    super(model);
    this.lockpickBonus = 15;
    if (model.itemType == "lockpicking-kit-v2")
      this.lockpickBonus *= 2;
  }
}
