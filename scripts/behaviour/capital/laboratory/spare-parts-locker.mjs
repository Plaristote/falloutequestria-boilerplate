import {LockedStorage} from "../../locked-storage.mjs"

class SparePartsLocker extends LockedStorage {
  constructor(model) {
    super(model, {
      lockpickLevel: 5,
      breakable: false
    });
  }

  onUseItem(user, item) {
    if (item.itemType === "capital-laboratory-locker-key") {
      this.lockedComponent.toggleLocked();
    }
  }
}

export function create(model) {
  return new SparePartsLocker(model);
}
