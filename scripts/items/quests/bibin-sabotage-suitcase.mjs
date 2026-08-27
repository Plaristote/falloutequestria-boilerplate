import {ItemBehaviour}  from "../item.mjs";
import {hasSuitcaseBeenOpened, onSuitcaseOpened} from "../../quests/cristal-den/bibins-sabotage-delivery.mjs";
import {receiveSuitcaseEntryState} from "../../dialogs/hillburrow/water-carrier.mjs";

export class BibinSabotageSuitcase extends ItemBehaviour {
  constructor(model) {
    super(model);
  }

  get requiresTarget() {
    return false;
  }

  get isOpened() {
    return hasSuitcaseBeenOpened();
  }

  useOn(target) {
    if (!target && !this.isOpened)
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
