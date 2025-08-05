import {ShopOwner} from "./../../shop-owner.mjs";

export default class Owner extends ShopOwner {
  constructor(model) {
    super(model);
    this.dialog = "cristal-den/chemlab/owner";
  }

  get shopShelfs() {
    return [level.findObject("chem-store.shelf")];
  }
}
