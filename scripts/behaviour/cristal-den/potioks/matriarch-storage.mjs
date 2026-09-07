import {OwnedStorage} from "../../ownedStorage.mjs";

export class MatriarchStorage extends OwnedStorage {
  get storageOwners() {
    return [level.findObject("matriarch")];
  }
}
