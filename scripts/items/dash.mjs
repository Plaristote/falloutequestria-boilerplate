import {Consumable} from "./consumable.mjs";

export default class extends Consumable {
  consumedBy(target) {
    target.addBuff("drugs/dash");
  }
}
