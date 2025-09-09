import {Consumable} from "./consumable.mjs";
import {getValueFromRange} from "../behaviour/random.mjs";

export class Food extends Consumable {
  consumedBy(target) {
    const stats   = target.statistics;
    const maxHeal = stats.maxHitPoints - stats.hitPoints;
    const healed = Math.min(maxHeal, Math.floor(getValueFromRange(2, 8)));

    stats.hitPoints += healed;
    game.appendToConsole(
      i18n.t("messages.use", {
        user: this.user.displayName, item: i18n.t("items." + this.model.itemType)
      }) + ' ' +
      i18n.t("messages.healed", {
        target: target.displayName, hp: healed
      })
    );
  }
}
