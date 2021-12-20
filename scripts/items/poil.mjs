import {ItemBehaviour} from "./item.mjs";

class Poil extends ItemBehaviour {
  constructor(model) {
    super(model);
  }
}

export function create(model) {
  return new Poil(model);
}