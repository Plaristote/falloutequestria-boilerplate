import {CharacterBehaviour} from "../character.mjs";
import {ShopOwner} from "../shop-owner.mjs";

class HillburrowShopOwner extends ShopOwner {
  constructor(model) {
    super(model);
    this.dialog = "hillburrow/steward";
  }
}

export function create(model) {
  return new HillburrowShopOwner(model);
}
