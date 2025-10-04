import HiddenRefugee from "./hiddenRefugee.mjs";

export default class Root extends HiddenRefugee {
  constructor(model) {
    super(model);
  }
}

export function create(model) {
  return new Root(model);
}
