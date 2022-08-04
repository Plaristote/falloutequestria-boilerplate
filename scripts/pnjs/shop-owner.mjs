import {CharacterBehaviour} from "./character.mjs";

class ShopOwner extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }
}

export function create(model) {
  return new ShopOwner(model);
}