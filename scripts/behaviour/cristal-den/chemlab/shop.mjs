import {Shop} from "../../shop.mjs";

export default class extends Shop {
  constructor(model) {
    super(model);
  }

  addPartyTimeMintalsToStock() {
    const shelf = this.model.findObject("shelf");
    const refillData = shelf.script.itemRefillData;

    refillData.push({
      itemType: "party-time-mint-als",
      quantity: 3
    });
    shelf.script.itemRefillData = refillData;
    shelf.inventory.addItemOfType("party-time-mint-als", 2);
  }
}
