import {OwnedStorage} from "../ownedStorage.mjs";

export default class extends OwnedStorage {
  get storageOwners() {
    return [level.findObject("police-hq.captain")];
  }
}
