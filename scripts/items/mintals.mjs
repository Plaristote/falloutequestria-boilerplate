import {Consumable} from "./consumable.mjs";

export default class extends Consumable {
  consumedBy(target) {
    if (target.getBuff("drugs/mintals-partytime"))
      game.appendToConsole(i18n.t("messages.nothing-happens"));
    else
      target.addBuff("drugs/mintals");
  }
}
