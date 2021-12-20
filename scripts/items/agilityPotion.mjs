import {ItemBehaviour} from "./item.mjs";

class AgilityPotion extends ItemBehaviour {
  constructor(model) {
    super(model);
    this.requiresTarget = false;
    this.triggersCombat = false;
    this.useModes = ["use"];
  }
  
  isValidTarget(object) {
    return object.getObjectType() == "Character";
  }
  
  getActionPointCost() {
    return 2;
  }

  useOn(target) {
    if (!target)
      target = this.user;
    target.statistics.agility += 1;
    this.user.inventory.removeItemOfType(this.model.itemType); // itemType == "agility-potion"
  }
}

export function create(model) {
  return new AgilityPotion(model);
}
