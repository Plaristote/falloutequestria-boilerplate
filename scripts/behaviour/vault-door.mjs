import {AutoClosingDoor} from "door-auto-close.mjs";

class VaultDoor extends AutoClosingDoor {
  constructor(model) {
    super(model);
    this.model.openSound   = "vault/door-open";
    this.model.closeSound  = "vault/door-close";
    this.model.lockedSound = "vault";
  }
}

export function create(model) {
  return new VaultDoor(model);
}
