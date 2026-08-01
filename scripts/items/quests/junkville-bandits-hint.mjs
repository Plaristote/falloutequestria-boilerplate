import {ItemBehaviour} from "./../item.mjs";
import {requireQuest} from "../../quests/helpers.mjs";

export default class extends ItemBehaviour {
  constructor(model) {
    super(model);
    this.useModes = ["use"];
  }

  get requiresTarget() {
    return false;
  }

  getActionPointCost() {
    return 1;
  }

  useOn(target) {
    if (target && target != this.model)
      return false;
    if (typeof level === "undefined" || level.name != null) {
      const quest = requireQuest("junkville/cavernBandits");
      const junkville = game.worldmap.getCity("junkville");

      quest.script.pushUniqueEvent("item-told-lair");
      game.worldmap.moveToCity(junkville);
      game.switchToLevel("junkville-cavern");
      game.appendToConsole(quest.tr("went-to-cavern-by-item"));
      this.user.inventory.destroyItem(this.model, 1);
    } else {
      game.appendToConsole(i18n.t("messages.worldmap-item-error"));
    }
    return true;
  }
}
