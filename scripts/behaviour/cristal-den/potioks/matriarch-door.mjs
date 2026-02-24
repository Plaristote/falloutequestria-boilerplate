import {VaultDoor} from "../../vault-door.mjs";
import {canGuardPreventInteraction} from "../../watchObject.mjs";
import {RanchAccess} from "../../../levels/cristal-den-ranch.mjs";

export class MatriarchDoor extends VaultDoor {
  get guard() {
    return level.findObject("bunker.secretary");
  }

  onUse(character) {
    const guard = this.guard;

    if (canGuardPreventInteraction(guard, character) &&
        character.getFactionName() != "potioks") {
      if (character == game.player && level.script.hasAccess(RanchAccess.MatriarchOffice)) {
        return false;
      }
      level.addTextBubble(guard, i18n.t("cristal-den.potioks.cant-enter-matriarch-office"), 5000, "yellow");
      return true;
    }
    return false;
  }
}
