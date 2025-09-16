import {AutoClosingDoor} from "../door-auto-close.mjs";

export default class extends AutoClosingDoor {
  canGoThrough(model) {
    return model.path == "weapon-shop.owner" || super.canGoThrough(model);
  }
}
