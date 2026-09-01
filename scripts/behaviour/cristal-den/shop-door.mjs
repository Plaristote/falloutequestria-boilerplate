import {Door} from "../door.mjs";

export default class extends Door {
  canGoThrough(character) {
    return character.path == "shop.owner" || super.canGoThrough(character);
  }
}
