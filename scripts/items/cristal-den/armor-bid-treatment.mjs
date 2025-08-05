import {Drink} from "../drink.mjs";

class ArmorBidTreatment extends Drink {
  constructor(model) {
    super(model);
  }

  consumedBy(target) {
    target.addBuff("armor-bid-treatment");
    if (target == game.player)
      game.appendToConsole(i18n.t("dialogs.cristal-den/doctor.on-treatment-consumed"));
  }
}

export function create(model) {
  return new ArmorBidTreatment(model);
}
