import Inn from "../inn.mjs";

export default class extends Inn {
  get innkeeper() {
    return level.findObject("cook");
  }

  get roomGroup() {
    return this.model.findGroup("floor");
  }
}
