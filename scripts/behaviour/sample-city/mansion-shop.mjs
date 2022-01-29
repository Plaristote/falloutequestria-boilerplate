import {Shop} from "../shop.mjs";
import {overrideBehaviour} from "../override.mjs";

class MansionShop extends Shop {
  constructor(model) {
    super(model);
    this.model.tasks.addTask("initializeDoorWatch", 100, 1);
  }
  
  initializeDoorWatch() {
    const owner = this.shopOwner;
    const doors = [
      this.model.parent.findObject("backdoor-inside"),
      this.model.parent.findObject("bedroom-door")
    ];

    doors.forEach(door => {
      overrideBehaviour(door.getScriptObject(), "onUse", (user) => {
        if (user !== this.shopOwner && this.isUnderSurveillance()) {
          level.addTextBubble(owner, "Don't touch that", 2000);
          return true;
        }
        return false;
      });
    });
  }
  
  get guards() {
    return level.findGroup("guards");
  }

  get bed() {
    return this.model.parent.findObject("bedroom.bed");
  }

  openShopRoutine() {
    super.openShopRoutine();
    if (this.isShopOwnerConscious())  {
      this.shopDoors.forEach(door => { door.opened = true; });
      this.shopOwner.getScriptObject().goToWork();
    }
  }

  closeShopRoutine() {
    super.closeShopRoutine();
    if (this.isShopOwnerConscious())
      this.shopOwner.getScriptObject().goToSleep();
  }

  mansionOccupants() {
    var occupants = this.shopOccupants();

    ["backroom", "bedroom", "upstairs"].forEach(groupName => {
      const group = this.model.parent.findGroup(groupName);

      occupants = occupants.concat(group.getControlZoneOccupants());
    });
    return occupants;
  }
}

export function create(model) {
  return new MansionShop(model);
}
