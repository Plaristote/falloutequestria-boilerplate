import {LockedStorage} from "../locked-storage.mjs";
import {OwnedStorage} from "../ownedStorage.mjs";

class OwnedStorageComponent extends OwnedStorage {
  get storageOwners() {
    return level.findGroup("pack").objects;
  }
}

export default class UndergroundChest extends LockedStorage {
  constructor(model) {
    super(model, { lockpickLevel: 4 });
    this.sneak = 160;
    this.ownedComponent = new OwnedStorageComponent(model);
    this.onTakeItem = this.ownedComponent.onTakeItem.bind(this.ownedComponent);
    this.onPutItem = this.ownedComponent.onPutItem.bind(this.ownedComponent);
    console.log("KEUMEEEEUH");
  }

  initialize() {
    console.log("UNDERGROUND CHEST WTF");
    this.model.toggleSneaking(true);
  }

  onUse() {
    return this.ownedComponent.onUse() ? true : super.onUse();
  }
}
