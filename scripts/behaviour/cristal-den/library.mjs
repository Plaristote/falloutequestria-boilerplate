import {Shop} from "../shop.mjs";

export default class extends Shop {
  constructor(model) {
    this.model = model;
  }

  refillShop() {
    this.shopShelfs.forEach(shelf => {
      if (shelf.objectName == "spell-books")
        console.log("// TODO custom refillers for spell books and skill books");
      else if (shelf.script?.onShopRefill)
        shelf.script.onShopRefill();
    });
  }
}
