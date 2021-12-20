import {Rat} from "./rat.mjs";

class GiantRat extends Rat {
}

class RatKing extends GiantRat {
  constructor(model) {
    super(model);
    this.dialog = "ratKing";
  }
}

export function create(model) {
  return new RatKing(model);
}
