import {LockedStorage} from "../../locked-storage.mjs"

export default class extends LockedStorage {
  constructor(model) {
    super(model, {
      lockpickLevel: 3,
      breakable: false
    });
  }
}
