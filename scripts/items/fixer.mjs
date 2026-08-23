import {Consumable} from "./consumable.mjs";

export default class extends Consumable {
  consumedBy(target) {
    const buff = target.getBuff("withdrawal");
    if (buff)
      buff.script.cureAllAddictions();
  }
}
