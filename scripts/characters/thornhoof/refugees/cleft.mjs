import HiddenRefugee from "./hiddenRefugee.mjs";

export default class Cleft extends HiddenRefugee {
  constructor(model) {
    super(model);
  }
}

export function create(model) {
  return new Cleft(model);
}
