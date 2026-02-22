import {AutoClosingDoor} from "../door-auto-close.mjs";

export default class extends AutoClosingDoor {
  onLoaded() {
    this.owner = level.findObject("weapon-shop.owner");
  }

  canGoThrough(model) {
    return model.path === this.owner || model.parent?.name == "guards" || super.canGoThrough(model);
  }
}
