import {ShopOwner} from "./../shop-owner.mjs";

export default class GeneralStoreOwner extends ShopOwner {
  constructor(model) {
    super(model);
    this.dialog = "cristal-den/general-store-owner";
  }
}
