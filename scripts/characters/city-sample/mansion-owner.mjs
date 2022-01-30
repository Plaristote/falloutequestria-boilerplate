import {ShopOwner} from "./shop-owner.mjs";
import {callGuards, AlarmLevel} from "../components/alarm.mjs";

class MansionOwner extends ShopOwner {
  constructor(model) {
    super(model);
  }

  onCharacterDetected(character) {
    const script = this.shop ? this.shop.getScriptObject() : null;

    if (script && !script.opened && script.mansionOccupants().indexOf(character) >= 0) {
      level.addTextBubble(this.model, i18n.t("bubbles.shop-closed"), 2000, "orange");
      callGuards(level.findGroup("guards"), character, AlarmLevel.Arrest);
    }
    else
      super.onCharacterDetected();
  }
}

export function create(model) {
  return new MansionOwner(model);
}
