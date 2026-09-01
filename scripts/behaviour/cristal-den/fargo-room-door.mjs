import {Door} from "../door.mjs";

export default class extends Door {
  canGoThrough(character) {
    return character.path == "caravaneers.caravan-boss" || super.canGoThrough(character);
  }
}
