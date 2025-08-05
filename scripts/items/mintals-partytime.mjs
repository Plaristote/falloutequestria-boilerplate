import {Consumable} from "./consumable.mjs";

export default class extends Consumable {
  consumedBy(target) {
    const mintals = target.getBuff("drugs/mintals");
    if (mintals) mintals.remove();
    target.addBuff("drugs/mintals-partytime");
  }
}
