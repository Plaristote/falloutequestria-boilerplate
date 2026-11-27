import {ItemBehaviour}  from "../item.mjs";
import {hasSuitcaseBeenOpened, onSuitcaseOpened} from "../../quests/cristal-den/bibins-sabotage-delivery.mjs";
import {receiveSuitcaseEntryState} from "../../dialogs/hillburrow/water-carrier.mjs";

export default class BibinSabotageSuitcase extends ItemBehaviour {
  constructor(model) {
    super(model);
    this.useModes = ["use"];
  }

  get requiresTarget() {
    return false;
  }

  get isOpened() {
    return hasSuitcaseBeenOpened();
  }

  useOn(target) {
    // Using the item from the inventory targets the item itself.
    if ((!target || target == this.model) && !this.isOpened)
      onSuitcaseOpened();
    else if (target == game.getCharacter("hillburrow/water-carrier"))
      level.initializeDialog(target, "hillburrow/water-carrier", receiveSuitcaseEntryState());
    return true;
  }

  giveTo(target) {
    target.inventory.addItemOfType("dynamite", 4);
    this.user.inventory.destroyItem(this.model);
  }
}
